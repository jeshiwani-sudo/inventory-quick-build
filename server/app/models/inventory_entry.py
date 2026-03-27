from app import db
from datetime import datetime

class InventoryEntry(db.Model):
    __tablename__ = 'inventory_entries'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    clerk_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quantity_received = db.Column(db.Integer, default=0)
    quantity_in_stock = db.Column(db.Integer, default=0)
    quantity_spoilt = db.Column(db.Integer, default=0)
    buying_price = db.Column(db.Float, nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), default='unpaid')  # 'paid' or 'unpaid'
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    product = db.relationship('Product', back_populates='inventory_entries')
    clerk = db.relationship('User', back_populates='inventory_entries')

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'clerk_id': self.clerk_id,
            'clerk_name': self.clerk.full_name if self.clerk else None,
            'quantity_received': self.quantity_received,
            'quantity_in_stock': self.quantity_in_stock,
            'quantity_spoilt': self.quantity_spoilt,
            'buying_price': self.buying_price,
            'selling_price': self.selling_price,
            'payment_status': self.payment_status,
            'recorded_at': self.recorded_at.strftime('%B %d, %Y %I:%M %p') if self.recorded_at else None
        }