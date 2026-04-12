from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.store import Store
from app.models.user import User
from app.models.store_product import StoreProduct

stores_bp = Blueprint('stores', __name__)

# -----------------------------------------------
# GET STORES — merchant sees only their own stores
# -----------------------------------------------
@stores_bp.route('/', methods=['GET'])
@jwt_required()
def get_stores():
    claims = get_jwt()
    role = claims.get('role')
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if role == 'merchant':
        # Only return stores this merchant created/owns
        stores = Store.query.filter_by(merchant_id=current_user_id).all()
    elif role == 'admin':
        stores = Store.query.filter_by(id=current_user.store_id).all()
    else:
        return jsonify({'error': 'Not authorized'}), 403

    return jsonify({'stores': [s.to_dict() for s in stores]}), 200

# -----------------------------------------------
# CREATE STORE — automatically linked to this merchant
# -----------------------------------------------
@stores_bp.route('/', methods=['POST'])
@jwt_required()
def create_store():
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchant can create stores'}), 403

    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('name'):
        return jsonify({'error': 'Store name is required'}), 400

    store = Store(
        name=data['name'],
        location=data.get('location', ''),
        merchant_id=current_user_id  
    )
    db.session.add(store)
    db.session.commit()

    return jsonify({'message': 'Store created', 'store': store.to_dict()}), 201

# -----------------------------------------------
# UPDATE STORE 
# -----------------------------------------------
@stores_bp.route('/<int:store_id>', methods=['PUT'])
@jwt_required()
def update_store(store_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchant can update stores'}), 403

    current_user_id = get_jwt_identity()
    store = Store.query.filter_by(id=store_id, merchant_id=current_user_id).first()
    if not store:
        return jsonify({'error': 'Store not found or not authorized'}), 404

    data = request.get_json()
    if data.get('name'):
        store.name = data['name']
    if data.get('location'):
        store.location = data['location']

    db.session.commit()
    return jsonify({'message': 'Store updated', 'store': store.to_dict()}), 200

# -----------------------------------------------
# DELETE STORE 
# -----------------------------------------------
@stores_bp.route('/<int:store_id>', methods=['DELETE'])
@jwt_required()
def delete_store(store_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchant can delete stores'}), 403

    current_user_id = get_jwt_identity()
    store = Store.query.filter_by(id=store_id, merchant_id=current_user_id).first()
    if not store:
        return jsonify({'error': 'Store not found or not authorized'}), 404

    db.session.delete(store)
    db.session.commit()
    return jsonify({'message': f'Store "{store.name}" deleted'}), 200