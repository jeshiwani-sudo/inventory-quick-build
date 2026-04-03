from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app import db, mail
from app.models.user import User
from app.utils.validators import validate_email, validate_password
from app.utils.email import send_invite_email
import bcrypt
import secrets
from datetime import datetime, timedelta
from flask_mail import Message

auth_bp = Blueprint('auth', __name__)


# =============================================
# HEALTH CHECK
# =============================================
@auth_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'message': 'Auth routes working! ✅'}), 200


# =============================================
# SETUP FIRST MERCHANT (run once)
# =============================================
@auth_bp.route('/setup', methods=['POST'])
def setup_merchant():
    if User.query.filter_by(role='merchant').first():
        return jsonify({'error': 'Merchant already exists'}), 400

    data = request.get_json()
    if not data or not data.get('full_name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'full_name, email and password are required'}), 400

    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email'}), 400

    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    merchant = User(
        full_name=data['full_name'],
        email=data['email'],
        password_hash=password_hash,
        role='merchant',
        is_active=True,
        is_verified=True,
        phone_number=data.get('phone_number')
    )

    db.session.add(merchant)
    db.session.commit()

    return jsonify({'message': 'Merchant created successfully', 'user': merchant.to_dict()}), 201


# =============================================
# INVITE USER (Fixed - no null full_name error)
# =============================================
@auth_bp.route('/invite', methods=['POST'])
@jwt_required()
def invite_user():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    claims = get_jwt()
    role = claims.get('role')

    if role not in ['merchant', 'admin']:
        return jsonify({'error': 'Only merchant or admin can send invites'}), 403

    data = request.get_json()
    email = data.get('email')
    invite_role = data.get('role')
    store_id = data.get('store_id')

    if not email or not validate_email(email):
        return jsonify({'error': 'Valid email is required'}), 400

    if invite_role not in ['admin', 'clerk']:
        return jsonify({'error': 'Invalid role'}), 400

    if role == 'admin' and invite_role != 'clerk':
        return jsonify({'error': 'Admins can only invite clerks'}), 403

    # Generate token
    token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=48)

    try:
        # Send email
        send_invite_email(email, token, invite_role, store_id)

        return jsonify({
            'message': f'Invite sent to {email} ✅',
            'token': token
        }), 200

    except Exception as e:
        print(f"Invite error: {e}")
        return jsonify({'error': 'Failed to send invite'}), 500


# =============================================
# REGISTER FROM INVITE
# =============================================
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    token = data.get('token')
    full_name = data.get('full_name')
    phone_number = data.get('phone_number')
    password = data.get('password')

    if not token or not full_name or not password:
        return jsonify({'error': 'Token, full_name and password are required'}), 400

    user = User.query.filter_by(invite_token=token).first()

    if not user:
        return jsonify({'error': 'Invalid or expired invite link'}), 400

    if user.is_verified:
        return jsonify({'error': 'This invite has already been used'}), 400

    if datetime.utcnow() > user.invite_token_expiry:
        return jsonify({'error': 'Invite link has expired'}), 400

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    user.full_name = full_name
    user.phone_number = phone_number
    user.password_hash = password_hash
    user.is_verified = True
    user.invite_token = None
    user.invite_token_expiry = None

    db.session.commit()

    return jsonify({
        'message': 'Registration successful! Please login.',
        'user': user.to_dict()
    }), 201


# =============================================
# LOGIN
# =============================================
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is suspended'}), 403

    if not user.is_verified:
        return jsonify({'error': 'Account not verified'}), 403

    access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})

    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


# =============================================
# GET ALL USERS (for admins/merchant)
# =============================================
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    claims = get_jwt()
    role = claims.get('role')

    if role not in ['merchant', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403

    users = User.query.all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


# =============================================
# TOGGLE ACTIVE / SUSPEND
# =============================================
@auth_bp.route('/users/<int:user_id>/toggle-active', methods=['PATCH'])
@jwt_required()
def toggle_user_active(user_id):
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if not current_user or current_user.role not in ['merchant', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if current_user.role == 'admin' and user.role != 'clerk':
        return jsonify({'error': 'Admins can only suspend clerks'}), 403

    user.is_active = not user.is_active
    db.session.commit()

    status = "activated" if user.is_active else "suspended"
    return jsonify({
        'message': f'User has been {status} successfully',
        'user': user.to_dict()
    }), 200


# =============================================
# DELETE USER
# =============================================
@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if not current_user or current_user.role != 'merchant':
        return jsonify({'error': 'Only merchant can delete users'}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200