from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.product import Product
from app.models.store_product import StoreProduct
from app.models.store import Store
from app.models.user import User

products_bp = Blueprint('products', __name__)

def get_merchant_store_ids(merchant_id):
    stores = Store.query.filter_by(merchant_id=merchant_id).all()
    return [s.id for s in stores]

# -----------------------------------------------
# GET STORE PRODUCTS (Clerk/Admin form dropdowns)
# -----------------------------------------------
@products_bp.route('/store-products', methods=['GET'])
@jwt_required()
def get_store_products():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    claims = get_jwt()
    role = claims.get('role')

    if role in ['clerk', 'admin']:
        if not current_user or not current_user.store_id:
            return jsonify({'error': 'Not assigned to any store'}), 403
        store_products = StoreProduct.query.filter_by(store_id=current_user.store_id).all()

    elif role == 'merchant':
        # Only products in this merchant's own stores
        owned_ids = get_merchant_store_ids(current_user_id)
        store_products = StoreProduct.query.filter(
            StoreProduct.store_id.in_(owned_ids)
        ).all()

    else:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({'store_products': [sp.to_dict() for sp in store_products]}), 200

# -----------------------------------------------
# CREATE PRODUCT (Admin only, scoped to their store)
# -----------------------------------------------
@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Only admins can create products'}), 403

    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    if not current_user or not current_user.store_id:
        return jsonify({'error': 'Admin must be assigned to a store'}), 403

    data = request.get_json()
    if not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400

    product = Product(
        name=data['name'],
        description=data.get('description'),
        image_url=data.get('image_url')
    )
    db.session.add(product)
    db.session.commit()

    store_product = StoreProduct(
        store_id=current_user.store_id,
        product_id=product.id
    )
    db.session.add(store_product)
    db.session.commit()

    return jsonify({
        'message': 'Product created and assigned to store successfully',
        'product': product.to_dict()
    }), 201

# -----------------------------------------------
# GET ALL PRODUCTS (paginated, scoped per role)
# -----------------------------------------------
@products_bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    claims = get_jwt()
    role = claims.get('role')

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    if role in ['clerk', 'admin']:
        if not current_user or not current_user.store_id:
            return jsonify({'error': 'Not assigned to any store'}), 403
        store_products = StoreProduct.query.filter_by(store_id=current_user.store_id)\
            .paginate(page=page, per_page=per_page, error_out=False)

    elif role == 'merchant':
        # Only products from this merchant's own stores
        owned_ids = get_merchant_store_ids(current_user_id)
        store_products = StoreProduct.query.filter(
            StoreProduct.store_id.in_(owned_ids)
        ).paginate(page=page, per_page=per_page, error_out=False)

    else:
        return jsonify({'error': 'Unauthorized'}), 403

    result = []
    for sp in store_products.items:
        p_dict = sp.product.to_dict()
        p_dict['store_id'] = sp.store_id
        p_dict['store_name'] = sp.store.name if sp.store else 'Unknown'
        result.append(p_dict)

    return jsonify({
        'products': result,
        'total': store_products.total,
        'pages': store_products.pages,
        'current_page': store_products.page
    }), 200

# -----------------------------------------------
# DELETE PRODUCT
# -----------------------------------------------
@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    claims = get_jwt()
    current_user_id = get_jwt_identity()
    role = claims.get('role')

    if role not in ['admin', 'merchant']:
        return jsonify({'error': 'Not authorized'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    # If merchant, product belongs to their store
    if role == 'merchant':
        owned_ids = get_merchant_store_ids(current_user_id)
        linked = StoreProduct.query.filter(
            StoreProduct.product_id == product_id,
            StoreProduct.store_id.in_(owned_ids)
        ).first()
        if not linked:
            return jsonify({'error': 'Not authorized to delete this product'}), 403

    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': f'Product deleted successfully'}), 200