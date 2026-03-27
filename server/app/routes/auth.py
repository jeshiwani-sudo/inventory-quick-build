from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password, validate_required_fields
from app.utils.email import send_invite_email
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
# REGISTER FIRST MERCHANT (only once, on setup)
# -----------------------------------------------
@auth_bp.route('/setup', methods=['POST'])
def setup_merchant():
    """Create the very first merchant account"""

    # Check if a merchant already exists
    existing = User.query.filter_by(role='merchant').first()
    if existing:
        return jsonify({'error': 'Merchant already exists'}), 400

    data = request.get_json()

    # Validate required fields
    missing = validate_required_fields(data, ['full_name', 'email', 'password'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Validate email
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email address'}), 400

    # Validate password
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Hash the password (never store plain passwords!)
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
        'message': 'Merchant account created successfully! ✅',
        'user': merchant.to_dict()
    }), 201


# -----------------------------------------------
# LOGIN
# -----------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Validate required fields
    missing = validate_required_fields(data, ['email', 'password'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Find user by email
    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Check if account is active
    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated. Contact your admin.'}), 403

    # Check if account is verified
    if not user.is_verified:
        return jsonify({'error': 'Please verify your account first via the invite link sent to your email.'}), 403

    # Check password
    password_correct = bcrypt.checkpw(
        data['password'].encode('utf-8'),
        user.password_hash.encode('utf-8')
    )

    if not password_correct:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Create JWT token
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role}
    )

    return jsonify({
        'message': f'Welcome back, {user.full_name}! 👋',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


# -----------------------------------------------
# INVITE A NEW USER (merchant invites admin, admin invites clerk)
# -----------------------------------------------
@auth_bp.route('/invite', methods=['POST'])
@jwt_required()
def invite_user():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    # Validate required fields
    missing = validate_required_fields(data, ['email', 'role'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Check permissions
    # Merchant can only invite admins
    # Admin can only invite clerks
    if current_user.role == 'merchant' and data['role'] != 'admin':
        return jsonify({'error': 'Merchants can only invite admins'}), 403

    if current_user.role == 'admin' and data['role'] != 'clerk':
        return jsonify({'error': 'Admins can only invite clerks'}), 403

    if current_user.role == 'clerk':
        return jsonify({'error': 'Clerks cannot invite anyone'}), 403

    # Validate email
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email address'}), 400

    # Check if user already exists
    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': 'A user with this email already exists'}), 400

    # Generate a secure invite token
    invite_token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=24)

    # Create unverified user
    new_user = User(
        full_name='',
        email=data['email'],
        password_hash='',
        role=data['role'],
        is_active=True,
        is_verified=False,
        invite_token=invite_token,
        invite_token_expiry=expiry,
        store_id=data.get('store_id')
    )

    db.session.add(new_user)
    db.session.commit()

    # Send invite email
    invite_link = f"http://localhost:3000/register?token={invite_token}"
    send_invite_email(data['email'], invite_link, data['role'])

    return jsonify({
        'message': f'Invite sent to {data["email"]} ✅',
        'invite_token': invite_token  # shown here for testing, remove in production
    }), 200


# -----------------------------------------------
# COMPLETE REGISTRATION (after clicking invite link)
# -----------------------------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validate required fields
    missing = validate_required_fields(data, ['token', 'full_name', 'password'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Find user by token
    user = User.query.filter_by(invite_token=data['token']).first()

    if not user:
        return jsonify({'error': 'Invalid or expired invite token'}), 400

    # Check token expiry
    if datetime.utcnow() > user.invite_token_expiry:
        return jsonify({'error': 'Invite token has expired. Ask for a new invite.'}), 400

    # Validate password
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Hash the password
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    # Complete registration
    user.full_name = data['full_name']
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
# GET CURRENT LOGGED IN USER
# -----------------------------------------------
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200