from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.product import Product
from app.models.store import Store
from app.models.user import User
import cloudinary
import cloudinary.uploader
import os

products_bp = Blueprint('products', __name__)

# Setup Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


# -----------------------------------------------
# CREATE A PRODUCT (merchant or admin)
# -----------------------------------------------
@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    claims = get_jwt()
    role = claims.get('role')

    if role not in ['merchant', 'admin']:
        return jsonify({'error': 'Only merchants and admins can add products'}), 403

    # Handle both JSON and form data (for image uploads)
    name = request.form.get('name') or request.json.get('name')
    description = request.form.get('description') or request.json.get('description', '')
    store_id = request.form.get('store_id') or request.json.get('store_id')

    if not name:
        return jsonify({'error': 'Product name is required'}), 400

    if not store_id:
        return jsonify({'error': 'Store ID is required'}), 400

    store = Store.query.get(store_id)
    if not store:
        return jsonify({'error': 'Store not found'}), 404

    image_url = None

    # Handle image upload to Cloudinary
    if 'image' in request.files:
        file = request.files['image']
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder='inventory_app/products',
                transformation=[
                    {'width': 500, 'height': 500, 'crop': 'fill'}
                ]
            )
            image_url = upload_result['secure_url']
        except Exception as e:
            return jsonify({'error': f'Image upload failed: {str(e)}'}), 500

    product = Product(
        name=name,
        description=description,
        image_url=image_url,
        store_id=int(store_id)
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        'message': 'Product created successfully ✅',
        'product': product.to_dict()
    }), 201


# -----------------------------------------------
# GET ALL PRODUCTS (with pagination)
# -----------------------------------------------
@products_bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    claims = get_jwt()
    role = claims.get('role')

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Merchants see all products
    # Admins and clerks see only their store's products
    if role == 'merchant':
        products = Product.query.paginate(page=page, per_page=per_page, error_out=False)
    else:
        if not current_user.store_id:
            return jsonify({'error': 'You are not assigned to a store'}), 400
        products = Product.query.filter_by(
            store_id=current_user.store_id
        ).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'products': [p.to_dict() for p in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': products.page
    }), 200


# -----------------------------------------------
# GET ONE PRODUCT
# -----------------------------------------------
@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    product = Product.query.get(product_id)

    if not product:
        return jsonify({'error': 'Product not found'}), 404

    return jsonify({'product': product.to_dict()}), 200


# -----------------------------------------------
# UPDATE A PRODUCT (merchant or admin)
# -----------------------------------------------
@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    claims = get_jwt()
    if claims.get('role') not in ['merchant', 'admin']:
        return jsonify({'error': 'Only merchants and admins can update products'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json()
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)

    # Handle image update
    if 'image' in request.files:
        file = request.files['image']
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder='inventory_app/products',
                transformation=[
                    {'width': 500, 'height': 500, 'crop': 'fill'}
                ]
            )
            product.image_url = upload_result['secure_url']
        except Exception as e:
            return jsonify({'error': f'Image upload failed: {str(e)}'}), 500

    db.session.commit()

    return jsonify({
        'message': 'Product updated successfully ✅',
        'product': product.to_dict()
    }), 200


# -----------------------------------------------
# DELETE A PRODUCT (merchant only)
# -----------------------------------------------
@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchants can delete products'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': 'Product deleted successfully ✅'}), 200