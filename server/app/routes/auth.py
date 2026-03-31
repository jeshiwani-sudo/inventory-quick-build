from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app import db, mail
from app.models.user import User
from app.models.store import Store
from flask_mail import Message
import bcrypt
import secrets
from datetime import datetime, timedelta
import uuid

auth_bp = Blueprint('auth', __name__)


# -----------------------------------------------
# HEALTH CHECK
# -----------------------------------------------
@auth_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'message': 'Auth routes working! ✅'}), 200


# -----------------------------------------------
# SETUP FIRST MERCHANT (Super User)
# -----------------------------------------------
@auth_bp.route('/setup', methods=['POST'])
def setup_merchant():
    """Create the very first merchant account (only once)"""
    existing = User.query.filter_by(role='merchant').first()
    if existing:
        return jsonify({'error': 'Merchant account already exists'}), 400

    data = request.get_json()
    missing = [field for field in ['full_name', 'email', 'password'] if field not in data or not data[field]]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    merchant = User(
        full_name=data['full_name'],
        email=data['email'],
        password_hash=hashed.decode('utf-8'),
        role='merchant',
        is_active=True,
        is_verified=True
    )

    db.session.add(merchant)
    db.session.commit()

    return jsonify({
        'message': 'Merchant account created successfully',
        'user': merchant.to_dict()
    }), 201


# -----------------------------------------------
# INVITE USER (Merchant → Admin, Admin → Clerk)
# -----------------------------------------------
@auth_bp.route('/invite', methods=['POST'])
@jwt_required()
def invite_user():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    claims = get_jwt()

    data = request.get_json()
    email = data.get('email')
    invited_role = data.get('role')
    store_id = data.get('store_id')

    if not email or not invited_role:
        return jsonify({'error': 'Email and role are required'}), 400

    # Permission checks
    if claims.get('role') == 'clerk':
        return jsonify({'error': 'Clerks cannot invite users'}), 403
    if claims.get('role') == 'admin' and invited_role != 'clerk':
        return jsonify({'error': 'Admins can only invite clerks'}), 403
    if claims.get('role') == 'merchant' and invited_role != 'admin':
        return jsonify({'error': 'Merchants can only invite admins'}), 403

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User with this email already exists'}), 400

    invite_token = str(uuid.uuid4())
    expiry = datetime.utcnow() + timedelta(hours=24)

    new_user = User(
        email=email,
        role=invited_role,
        invite_token=invite_token,
        invite_token_expiry=expiry,
        store_id=store_id,
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    # Send email
    store = Store.query.get(store_id) if store_id else None
    store_name = store.name if store else None

    invite_link = f"http://localhost:3000/register?token={invite_token}"

    # Send email (you can improve this later)
    try:
        msg = Message(
            subject=f"Invitation to join Inventory App as {invited_role}",
            sender=os.getenv('MAIL_DEFAULT_SENDER'),
            recipients=[email]
        )
        msg.html = f"""
        <h2>You have been invited to join Inventory App</h2>
        <p>Role: <strong>{invited_role}</strong></p>
        {f'<p>Store: <strong>{store_name}</strong></p>' if store_name else ''}
        <p><a href="{invite_link}">Click here to complete registration</a></p>
        <p>This link expires in 24 hours.</p>
        """
        mail.send(msg)
    except Exception as e:
        print("Email failed:", e)

    return jsonify({
        'message': f'Invite sent to {email}',
        'invite_token': invite_token  # for testing only
    }), 200


# -----------------------------------------------
# COMPLETE REGISTRATION (with phone_number)
# -----------------------------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    token = data.get('token')
    full_name = data.get('full_name')
    phone_number = data.get('phone_number')
    password = data.get('password')

    if not all([token, full_name, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    user = User.query.filter_by(invite_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid or expired invite token'}), 400

    if datetime.utcnow() > user.invite_token_expiry:
        return jsonify({'error': 'Invite token has expired. Ask for a new invite.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user.full_name = full_name
    user.phone_number = phone_number
    user.password_hash = hashed.decode('utf-8')
    user.is_verified = True
    user.invite_token = None
    user.invite_token_expiry = None

    db.session.commit()

    return jsonify({
        'message': f'Registration complete! Welcome, {user.full_name} 🎉',
        'user': user.to_dict()
    }), 200


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
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Your account has been suspended'}), 403

    if not user.is_verified:
        return jsonify({'error': 'Account not verified'}), 403

    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role}
    )

    return jsonify({
        'message': f'Welcome back, {user.full_name}!',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


# -----------------------------------------------
# TOGGLE ACTIVE STATUS (Suspend / Activate)
# -----------------------------------------------
@auth_bp.route('/users/<int:user_id>/toggle-active', methods=['PATCH'])
@jwt_required()
def toggle_user_active(user_id):
    current_role = get_jwt().get('role')

    if current_role not in ['merchant', 'admin']:
        return jsonify({'error': 'Permission denied'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if current_role == 'admin' and user.role != 'clerk':
        return jsonify({'error': 'Admins can only toggle clerks'}), 403

    user.is_active = not user.is_active
    db.session.commit()

    status = "activated" if user.is_active else "suspended"

    return jsonify({
        'message': f'User has been {status}',
        'user': user.to_dict()
    }), 200


# -----------------------------------------------
# GET USERS (by role)
# -----------------------------------------------
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    role = request.args.get('role')
    query = User.query

    if role:
        query = query.filter_by(role=role)

    users = query.all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


# -----------------------------------------------
# DELETE USER
# -----------------------------------------------
@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_role = get_jwt().get('role')

    if current_role not in ['merchant', 'admin']:
        return jsonify({'error': 'Permission denied'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if current_role == 'admin' and user.role != 'clerk':
        return jsonify({'error': 'Admins can only delete clerks'}), 403

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f'User {user.full_name} deleted successfully'}), 200