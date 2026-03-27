from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.inventory_entry import InventoryEntry
from app.models.product import Product
from app.models.user import User
from datetime import datetime

inventory_bp = Blueprint('inventory', __name__)


# -----------------------------------------------
# CREATE AN INVENTORY ENTRY (clerk only)
# -----------------------------------------------
@inventory_bp.route('/', methods=['POST'])
@jwt_required()
def create_entry():
    claims = get_jwt()
    if claims.get('role') != 'clerk':
        return jsonify({'error': 'Only clerks can record inventory'}), 403

    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required = ['product_id', 'quantity_received', 'buying_price', 'selling_price']
    missing = [f for f in required if f not in data or data[f] == '']
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Check product exists
    product = db.session.get(Product, data['product_id'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    # Validate numbers are positive
    if int(data['quantity_received']) < 0:
        return jsonify({'error': 'Quantity cannot be negative'}), 400

    if float(data['buying_price']) < 0 or float(data['selling_price']) < 0:
        return jsonify({'error': 'Prices cannot be negative'}), 400

    entry = InventoryEntry(
        product_id=data['product_id'],
        clerk_id=current_user_id,
        quantity_received=data['quantity_received'],
        quantity_in_stock=data.get('quantity_in_stock', data['quantity_received']),
        quantity_spoilt=data.get('quantity_spoilt', 0),
        buying_price=data['buying_price'],
        selling_price=data['selling_price'],
        payment_status=data.get('payment_status', 'unpaid')
    )

    db.session.add(entry)
    db.session.commit()

    return jsonify({
        'message': 'Inventory entry recorded successfully ✅',
        'entry': entry.to_dict()
    }), 201


# -----------------------------------------------
# GET ALL ENTRIES (paginated)
# -----------------------------------------------
@inventory_bp.route('/', methods=['GET'])
@jwt_required()
def get_entries():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    claims = get_jwt()
    role = claims.get('role')

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Filter by payment status if provided
    payment_status = request.args.get('payment_status')

    if role == 'clerk':
        # Clerks see only their own entries
        query = InventoryEntry.query.filter_by(clerk_id=current_user_id)
    elif role == 'admin':
        # Admins see entries for their store's products
        store_product_ids = [p.id for p in Product.query.filter_by(
            store_id=current_user.store_id).all()]
        query = InventoryEntry.query.filter(
            InventoryEntry.product_id.in_(store_product_ids)
        )
    else:
        # Merchant sees everything
        query = InventoryEntry.query

    # Apply payment status filter
    if payment_status in ['paid', 'unpaid']:
        query = query.filter_by(payment_status=payment_status)

    entries = query.order_by(
        InventoryEntry.recorded_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'entries': [e.to_dict() for e in entries.items],
        'total': entries.total,
        'pages': entries.pages,
        'current_page': entries.page
    }), 200


# -----------------------------------------------
# GET ONE ENTRY
# -----------------------------------------------
@inventory_bp.route('/<int:entry_id>', methods=['GET'])
@jwt_required()
def get_entry(entry_id):
    entry = InventoryEntry.query.get(entry_id)

    if not entry:
        return jsonify({'error': 'Entry not found'}), 404

    return jsonify({'entry': entry.to_dict()}), 200


# -----------------------------------------------
# UPDATE PAYMENT STATUS (admin only)
# -----------------------------------------------
@inventory_bp.route('/<int:entry_id>/payment', methods=['PATCH'])
@jwt_required()
def update_payment_status(entry_id):
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'merchant']:
        return jsonify({'error': 'Only admins and merchants can update payment status'}), 403

    entry = InventoryEntry.query.get(entry_id)
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404

    data = request.get_json()
    if data.get('payment_status') not in ['paid', 'unpaid']:
        return jsonify({'error': 'Payment status must be paid or unpaid'}), 400

    entry.payment_status = data['payment_status']
    db.session.commit()

    return jsonify({
        'message': f'Payment status updated to {entry.payment_status} ✅',
        'entry': entry.to_dict()
    }), 200


# -----------------------------------------------
# GET REPORT - summary of entries
# -----------------------------------------------
@inventory_bp.route('/report/summary', methods=['GET'])
@jwt_required()
def get_summary():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    claims = get_jwt()
    role = claims.get('role')

    # Filter by store
    store_id = request.args.get('store_id', type=int)

    if role == 'clerk':
        entries = InventoryEntry.query.filter_by(clerk_id=current_user_id).all()
    elif role == 'admin':
        store_product_ids = [p.id for p in Product.query.filter_by(
            store_id=current_user.store_id).all()]
        entries = InventoryEntry.query.filter(
            InventoryEntry.product_id.in_(store_product_ids)
        ).all()
    else:
        if store_id:
            store_product_ids = [p.id for p in Product.query.filter_by(
                store_id=store_id).all()]
            entries = InventoryEntry.query.filter(
                InventoryEntry.product_id.in_(store_product_ids)
            ).all()
        else:
            entries = InventoryEntry.query.all()

    # Calculate totals
    total_items_received = sum(e.quantity_received for e in entries)
    total_items_in_stock = sum(e.quantity_in_stock for e in entries)
    total_items_spoilt = sum(e.quantity_spoilt for e in entries)
    total_paid = sum(e.buying_price * e.quantity_received
                     for e in entries if e.payment_status == 'paid')
    total_unpaid = sum(e.buying_price * e.quantity_received
                       for e in entries if e.payment_status == 'unpaid')

    return jsonify({
        'summary': {
            'total_items_received': total_items_received,
            'total_items_in_stock': total_items_in_stock,
            'total_items_spoilt': total_items_spoilt,
            'total_paid_amount': round(total_paid, 2),
            'total_unpaid_amount': round(total_unpaid, 2),
            'total_entries': len(entries)
        }
    }), 200