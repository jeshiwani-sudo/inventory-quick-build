from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.supply_request import SupplyRequest
from app.models.product import Product
from app.models.user import User

supply_bp = Blueprint('supply_requests', __name__)


# -----------------------------------------------
# CREATE SUPPLY REQUEST (Clerk only)
# -----------------------------------------------
@supply_bp.route('/', methods=['POST'])
@jwt_required()
def create_supply_request():
    claims = get_jwt()
    if claims.get('role') != 'clerk':
        return jsonify({'error': 'Only clerks can create supply requests'}), 403

    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    data = request.get_json()

    if not data.get('product_id') or not data.get('quantity_requested'):
        return jsonify({'error': 'Product and quantity are required'}), 400

    product = db.session.get(Product, data['product_id'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    # Clerk can only request for their own store's product
    if product.store_id != current_user.store_id:
        return jsonify({'error': 'You can only request products from your own store'}), 403

    request_obj = SupplyRequest(
        product_id=data['product_id'],
        clerk_id=current_user_id,
        store_id=current_user.store_id,
        quantity_requested=int(data['quantity_requested']),
        note=data.get('note', ''),
        status='pending'
    )

    db.session.add(request_obj)
    db.session.commit()

    return jsonify({
        'message': 'Supply request submitted successfully',
        'request': request_obj.to_dict()
    }), 201


# -----------------------------------------------
# GET SUPPLY REQUESTS (Role-based)
# -----------------------------------------------
@supply_bp.route('/', methods=['GET'])
@jwt_required()
def get_supply_requests():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    claims = get_jwt()
    role = claims.get('role')

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')

    query = SupplyRequest.query

    if role == 'clerk':
        # Clerks see only their own requests
        query = query.filter_by(clerk_id=current_user_id)
    elif role == 'admin':
        # Admins see requests for their store
        if current_user.store_id:
            query = query.filter_by(store_id=current_user.store_id)
        else:
            return jsonify({'error': 'Admin not assigned to any store'}), 403
    # Merchant sees ALL requests (no filter)

    if status in ['pending', 'approved', 'declined']:
        query = query.filter_by(status=status)

    requests = query.order_by(SupplyRequest.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'requests': [r.to_dict() for r in requests.items],
        'total': requests.total,
        'pages': requests.pages,
        'current_page': requests.page
    }), 200


# -----------------------------------------------
# RESPOND TO SUPPLY REQUEST (Admin only)
# -----------------------------------------------
@supply_bp.route('/<int:request_id>/respond', methods=['PATCH'])
@jwt_required()
def respond_to_request(request_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Only admins can respond to supply requests'}), 403

    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    req = SupplyRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Supply request not found'}), 404

    # Admin can only respond to requests in their own store
    if req.store_id != current_user.store_id:
        return jsonify({'error': 'You can only respond to requests from your own store'}), 403

    data = request.get_json()
    new_status = data.get('status')
    if new_status not in ['approved', 'declined']:
        return jsonify({'error': 'Status must be approved or declined'}), 400

    req.status = new_status
    req.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': f'Request {new_status} successfully',
        'request': req.to_dict()
    }), 200


# -----------------------------------------------
# GET SINGLE REQUEST
# -----------------------------------------------
@supply_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_request(request_id):
    req = SupplyRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Request not found'}), 404

    return jsonify({'request': req.to_dict()}), 200