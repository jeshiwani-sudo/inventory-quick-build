from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.product import Product
from app.models.store_product import StoreProduct
from app.models.user import User
from app.models.store import Store

products_bp = Blueprint('products', __name__)

# -----------------------------------------------
# CREATE PRODUCT (Admin only) - now global
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

    # Create global product
    product = Product(
        name=data['name'],
        description=data.get('description'),
        image_url=data.get('image_url')
    )
    db.session.add(product)
    db.session.commit()

    # Link it to the admin's store via junction table
    store_product = StoreProduct(store_id=current_user.store_id, product_id=product.id)
    db.session.add(store_product)
    db.session.commit()

    return jsonify({
        'message': 'Product created and assigned to your store successfully',
        'product': product.to_dict()
    }), 201

# -----------------------------------------------
# GET ALL PRODUCTS (role-based)
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

    if role == 'clerk' or role == 'admin':
        if not current_user or not current_user.store_id:
            return jsonify({'error': 'Not assigned to any store'}), 403
        # Use junction table
        store_products = StoreProduct.query.filter_by(store_id=current_user.store_id)\
            .paginate(page=page, per_page=per_page, error_out=False)
    else:  # Merchant sees everything
        store_products = StoreProduct.query.paginate(page=page, per_page=per_page, error_out=False)

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
# DELETE PRODUCT (Admin only - their own store)
# -----------------------------------------------
@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Only admins can delete products'}), 403

    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    # Find the link in junction table
    store_product = StoreProduct.query.filter_by(product_id=product_id, store_id=current_user.store_id).first()
    if not store_product:
        return jsonify({'error': 'Product not found in your store'}), 404

    db.session.delete(store_product)
    db.session.commit()

    return jsonify({'message': 'Product removed from your store successfully'}), 200
