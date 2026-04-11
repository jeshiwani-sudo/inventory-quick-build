from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password, validate_required_fields
from app.utils.email import send_invite_email, send_reset_password_email
import bcrypt
import secrets
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)


# -----------------------------------------------
# HEALTH CHECK
# -----------------------------------------------
@auth_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'message': 'Auth routes working! ✅'}), 200


# -----------------------------------------------
# SETUP FIRST MERCHANT (only once)
# -----------------------------------------------
@auth_bp.route('/setup', methods=['POST'])
def setup_merchant():
    existing = User.query.filter_by(role='merchant').first()
    if existing:
        return jsonify({'error': 'Merchant already exists'}), 400

    data = request.get_json()
    missing = validate_required_fields(data, ['full_name', 'email', 'password'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    merchant = User(
        full_name=data['full_name'],
        email=data['email'],
        password_hash=hashed,
        role='merchant',
        is_verified=True,
        is_active=True
    )
    db.session.add(merchant)
    db.session.commit()

    return jsonify({'message': 'Merchant created successfully', 'user': merchant.to_dict()}), 201


# -----------------------------------------------
# LOGIN
# -----------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is suspended'}), 403

    if not user.is_verified:
        return jsonify({'error': 'Account is not verified'}), 403

    access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})

    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


# -----------------------------------------------
# REGISTER (from invite)
# -----------------------------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    token = data.get('token')
    full_name = data.get('full_name')
    password = data.get('password')

    if not token or not full_name or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    user = User.query.filter_by(invite_token=token).first()
    if not user or not user.invite_token_expiry or user.invite_token_expiry < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired invite token'}), 400

    user.full_name = full_name
    user.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user.is_verified = True
    user.invite_token = None
    user.invite_token_expiry = None

    db.session.commit()

    return jsonify({'message': 'Registration successful. You can now login.'}), 200


# -----------------------------------------------
# INVITE USER
# -----------------------------------------------
@auth_bp.route('/invite', methods=['POST'])
@jwt_required()
def invite():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if current_user.role not in ['merchant', 'admin']:
        return jsonify({'error': 'Only merchant or admin can invite users'}), 403

    data = request.get_json()
    email = data.get('email')
    role = data.get('role')
    store_id = data.get('store_id')

    if not email or not role:
        return jsonify({'error': 'Email and role are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=48)

    new_user = User(
        email=email,
        role=role,
        invite_token=token,
        invite_token_expiry=expiry,
        store_id=store_id if role != 'merchant' else None,
        is_verified=False,
        is_active=True
    )
    db.session.add(new_user)
    db.session.commit()

    invite_link = f"http://localhost:3000/register?token={token}"
    send_invite_email(email, invite_link, role, "LocalShop")

    return jsonify({'message': 'Invite sent successfully'}), 200


# -----------------------------------------------
# GET USERS (FIXED FILTERING)
# -----------------------------------------------
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    role = request.args.get('role')
    store_id = request.args.get('store_id', type=int)

    query = User.query

    if current_user.role == 'admin':
        # Admin can only see clerks of their own store
        if not current_user.store_id:
            return jsonify({'error': 'Admin not assigned to any store'}), 403
        query = query.filter_by(role='clerk', store_id=current_user.store_id)
    elif current_user.role == 'merchant':
        # Merchant can only see admins
        query = query.filter_by(role='admin')
    else:
        return jsonify({'error': 'Unauthorized'}), 403

    # Extra filters if provided
    if role:
        query = query.filter_by(role=role)
    if store_id:
        query = query.filter_by(store_id=store_id)

    users = query.all()
    return jsonify({'users': [user.to_dict() for user in users]}), 200


# -----------------------------------------------
# TOGGLE ACTIVE STATUS
# -----------------------------------------------
@auth_bp.route('/users/<int:user_id>/toggle-active', methods=['PATCH'])
@jwt_required()
def toggle_user_active(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if current_user.role == 'admin' and user.role != 'clerk':
        return jsonify({'error': 'Admins can only toggle clerks'}), 403

    user.is_active = not user.is_active
    db.session.commit()

    status = "activated" if user.is_active else "suspended"
    return jsonify({
        'message': f'User has been {status} successfully',
        'user': user.to_dict()
    }), 200


# -----------------------------------------------
# DELETE USER
# -----------------------------------------------
@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if current_user.role == 'admin' and user.role != 'clerk':
        return jsonify({'error': 'Admins can only delete clerks'}), 403

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f'User {user.full_name} has been deleted successfully'}), 200


# =============================================
# FORGOT PASSWORD
# =============================================
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=2)
    db.session.commit()

    reset_link = f"http://localhost:3000/reset-password?token={token}"
    send_reset_password_email(user.email, reset_link)

    return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200


# =============================================
# RESET PASSWORD
# =============================================
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({'error': 'Token and password are required'}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired token'}), 400

    user.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({'message': 'Password reset successful'}), 200


# =============================================
# CHANGE PASSWORD (Logged in user)
# =============================================
@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password are required'}), 400

    if not bcrypt.checkpw(current_password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Current password is incorrect'}), 401

    user.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'}), 200


# =============================================
# UPDATE PROFILE (Edit Name & Phone)
# =============================================
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if data.get('full_name'):
        user.full_name = data['full_name']
    if 'phone_number' in data:
        user.phone_number = data['phone_number']

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200