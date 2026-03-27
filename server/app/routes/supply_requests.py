from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.supply_request import SupplyRequest
from app.models.product import Product
from app.models.user import User

supply_bp = Blueprint('supply', __name__)


# -----------------------------------------------
# CREATE A SUPPLY REQUEST (clerk only)
# -----------------------------------------------
@supply_bp.route('/', methods=['POST'])
@jwt_required()
def create_request():
    claims = get_jwt()
    if claims.get('role') != 'clerk':
        return jsonify({'error': 'Only clerks can request supplies'}), 403

    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    data = request.get_json()

    # Validate required fields
    required = ['product_id', 'quantity_requested']
    missing = [f for f in required if f not in data or data[f] == '']
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Check product exists
    product = Product.query.get(data['product_id'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    if int(data['quantity_requested']) <= 0:
        return jsonify({'error': 'Quantity must be greater than zero'}), 400

    supply_request = SupplyRequest(
        product_id=data['product_id'],
        clerk_id=current_user_id,
        store_id=current_user.store_id,
        quantity_requested=data['quantity_requested'],
        note=data.get('note', '')
    )

    db.session.add(supply_request)
    db.session.commit()

    return jsonify({
        'message': 'Supply request submitted successfully ✅',
        'request': supply_request.to_dict()
    }), 201


# -----------------------------------------------
# GET ALL SUPPLY REQUESTS (paginated)
# -----------------------------------------------
@supply_bp.route('/', methods=['GET'])
@jwt_required()
def get_requests():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    claims = get_jwt()
    role = claims.get('role')

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')

    if role == 'clerk':
        # Clerks see only their own requests
        query = SupplyRequest.query.filter_by(clerk_id=current_user_id)
    elif role == 'admin':
        # Admins see requests for their store
        query = SupplyRequest.query.filter_by(store_id=current_user.store_id)
    else:
        # Merchant sees all requests
        store_id = request.args.get('store_id', type=int)
        query = SupplyRequest.query
        if store_id:
            query = query.filter_by(store_id=store_id)

    # Filter by status
    if status in ['pending', 'approved', 'declined']:
        query = query.filter_by(status=status)

    requests = query.order_by(
        SupplyRequest.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'requests': [r.to_dict() for r in requests.items],
        'total': requests.total,
        'pages': requests.pages,
        'current_page': requests.page
    }), 200


# -----------------------------------------------
# APPROVE OR DECLINE A REQUEST (admin only)
# -----------------------------------------------
@supply_bp.route('/<int:request_id>/respond', methods=['PATCH'])
@jwt_required()
def respond_to_request(request_id):
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'merchant']:
        return jsonify({'error': 'Only admins and merchants can respond to requests'}), 403

    supply_request = SupplyRequest.query.get(request_id)
    if not supply_request:
        return jsonify({'error': 'Supply request not found'}), 404

    if supply_request.status != 'pending':
        return jsonify({'error': f'This request has already been {supply_request.status}'}), 400

    data = request.get_json()
    if data.get('status') not in ['approved', 'declined']:
        return jsonify({'error': 'Status must be approved or declined'}), 400

    supply_request.status = data['status']
    if data.get('note'):
        supply_request.note = data['note']

    db.session.commit()

    return jsonify({
        'message': f'Request {supply_request.status} successfully ✅',
        'request': supply_request.to_dict()
    }), 200


# -----------------------------------------------
# GET ONE SUPPLY REQUEST
# -----------------------------------------------
@supply_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_request(request_id):
    supply_request = SupplyRequest.query.get(request_id)

    if not supply_request:
        return jsonify({'error': 'Supply request not found'}), 404

    return jsonify({'request': supply_request.to_dict()}), 200