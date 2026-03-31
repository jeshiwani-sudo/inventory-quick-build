from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.store import Store
from app.models.user import User

stores_bp = Blueprint('stores', __name__)


# -----------------------------------------------
# GET ALL STORES (Merchant sees all, Admin sees only their own)
# -----------------------------------------------
@stores_bp.route('/', methods=['GET'])
@jwt_required()
def get_stores():
    claims = get_jwt()
    role = claims.get('role')
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if role == 'merchant':
        stores = Store.query.all()
    elif role == 'admin':
        stores = Store.query.filter_by(id=current_user.store_id).all()
    else:
        return jsonify({'error': 'Not authorized to view stores'}), 403

    return jsonify({
        'stores': [s.to_dict() for s in stores]
    }), 200


# -----------------------------------------------
# CREATE NEW STORE (Merchant only)
# -----------------------------------------------
@stores_bp.route('/', methods=['POST'])
@jwt_required()
def create_store():
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchant can create stores'}), 403

    data = request.get_json()
    if not data.get('name') or not data.get('location'):
        return jsonify({'error': 'Name and location are required'}), 400

    store = Store(
        name=data['name'],
        location=data['location']
    )

    db.session.add(store)
    db.session.commit()

    return jsonify({
        'message': 'Store created successfully',
        'store': store.to_dict()
    }), 201


# -----------------------------------------------
# UPDATE STORE (Merchant only)
# -----------------------------------------------
@stores_bp.route('/<int:store_id>', methods=['PUT'])
@jwt_required()
def update_store(store_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchant can update stores'}), 403

    store = Store.query.get(store_id)
    if not store:
        return jsonify({'error': 'Store not found'}), 404

    data = request.get_json()

    if data.get('name'):
        store.name = data['name']
    if data.get('location'):
        store.location = data['location']

    db.session.commit()

    return jsonify({
        'message': 'Store updated successfully',
        'store': store.to_dict()
    }), 200


# -----------------------------------------------
# DELETE STORE (Merchant only)
# -----------------------------------------------
@stores_bp.route('/<int:store_id>', methods=['DELETE'])
@jwt_required()
def delete_store(store_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchant can delete stores'}), 403

    store = Store.query.get(store_id)
    if not store:
        return jsonify({'error': 'Store not found'}), 404

    # Safety check: Don't allow deletion if there are users or products attached
    if store.users:
        return jsonify({'error': 'Cannot delete store with assigned users. Reassign users first.'}), 400
    if store.products:
        return jsonify({'error': 'Cannot delete store with products. Delete products first.'}), 400

    db.session.delete(store)
    db.session.commit()

    return jsonify({'message': f'Store "{store.name}" deleted successfully'}), 200


# -----------------------------------------------
# GET SINGLE STORE
# -----------------------------------------------
@stores_bp.route('/<int:store_id>', methods=['GET'])
@jwt_required()
def get_store(store_id):
    store = Store.query.get(store_id)
    if not store:
        return jsonify({'error': 'Store not found'}), 404

    return jsonify({'store': store.to_dict()}), 200