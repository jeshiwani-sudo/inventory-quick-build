from app import db
from datetime import datetime

class SupplyRequest(db.Model):
    __tablename__ = 'supply_requests'

    id = db.Column(db.Integer, primary_key=True)
    # Changed for new store_products junction table: product_id → store_product_id
    store_product_id = db.Column(db.Integer, db.ForeignKey('store_products.id'), nullable=False)
    clerk_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    quantity_requested = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships - Updated for new junction table
    store_product = db.relationship('StoreProduct')
    clerk = db.relationship('User', back_populates='supply_requests')
    store = db.relationship('Store', back_populates='supply_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'store_product_id': self.store_product_id,
            'product_name': self.store_product.product.name if self.store_product and self.store_product.product else None,
            'clerk_id': self.clerk_id,
            'clerk_name': self.clerk.full_name if self.clerk else None,
            'store_id': self.store_id,
            'quantity_requested': self.quantity_requested,
            'status': self.status,
            'note': self.note,
            'created_at': self.created_at.strftime('%B %d, %Y %I:%M %p') if self.created_at else None
        }
