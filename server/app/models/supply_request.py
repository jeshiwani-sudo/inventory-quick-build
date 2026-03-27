from app import db
from datetime import datetime

class SupplyRequest(db.Model):
    __tablename__ = 'supply_requests'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    clerk_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    quantity_requested = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'declined'
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = db.relationship('Product')
    clerk = db.relationship('User', back_populates='supply_requests')
    store = db.relationship('Store', back_populates='supply_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'clerk_id': self.clerk_id,
            'clerk_name': self.clerk.full_name if self.clerk else None,
            'store_id': self.store_id,
            'quantity_requested': self.quantity_requested,
            'status': self.status,
            'note': self.note,
            'created_at': self.created_at.strftime('%B %d, %Y %I:%M %p') if self.created_at else None
        }