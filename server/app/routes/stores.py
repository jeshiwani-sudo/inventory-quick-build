from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.store import Store
from app.models.user import User

stores_bp = Blueprint('stores', __name__)


# -----------------------------------------------
# CREATE A STORE (merchant only)
# -----------------------------------------------
@stores_bp.route('/', methods=['POST'])
@jwt_required()
def create_store():
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchants can create stores'}), 403

    data = request.get_json()

    if not data.get('name'):
        return jsonify({'error': 'Store name is required'}), 400

    store = Store(
        name=data['name'],
        location=data.get('location', '')
    )

    db.session.add(store)
    db.session.commit()

    return jsonify({
        'message': 'Store created successfully ✅',
        'store': store.to_dict()
    }), 201


# -----------------------------------------------
# GET ALL STORES (merchant only) - with pagination
# -----------------------------------------------
@stores_bp.route('/', methods=['GET'])
@jwt_required()
def get_stores():
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchants can view all stores'}), 403

    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    stores = Store.query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'stores': [s.to_dict() for s in stores.items],
        'total': stores.total,
        'pages': stores.pages,
        'current_page': stores.page
    }), 200


# -----------------------------------------------
# GET ONE STORE
# -----------------------------------------------
@stores_bp.route('/<int:store_id>', methods=['GET'])
@jwt_required()
def get_store(store_id):
    store = db.session.get(Store, store_id)

    if not store:
        return jsonify({'error': 'Store not found'}), 404

    return jsonify({'store': store.to_dict()}), 200


# -----------------------------------------------
# UPDATE A STORE (merchant only)
# -----------------------------------------------
@stores_bp.route('/<int:store_id>', methods=['PUT'])
@jwt_required()
def update_store(store_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchants can update stores'}), 403

    store = Store.query.get(store_id)
    if not store:
        return jsonify({'error': 'Store not found'}), 404

    data = request.get_json()
    store.name = data.get('name', store.name)
    store.location = data.get('location', store.location)
    store.is_active = data.get('is_active', store.is_active)

    db.session.commit()

    return jsonify({
        'message': 'Store updated successfully ✅',
        'store': store.to_dict()
    }), 200


# -----------------------------------------------
# DELETE A STORE (merchant only)
# -----------------------------------------------
@stores_bp.route('/<int:store_id>', methods=['DELETE'])
@jwt_required()
def delete_store(store_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchants can delete stores'}), 403

    store = db.session.get(Store, store_id)
    if not store:
        return jsonify({'error': 'Store not found'}), 404

    db.session.delete(store)
    db.session.commit()

    return jsonify({'message': 'Store deleted successfully ✅'}), 200