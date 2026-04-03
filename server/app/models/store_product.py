from app import db
from datetime import datetime

class StoreProduct(db.Model):
    __tablename__ = 'store_products'

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    store = db.relationship('Store', back_populates='store_products')
    product = db.relationship('Product', back_populates='store_products')
    inventory_entries = db.relationship('InventoryEntry', back_populates='store_product', cascade='all, delete-orphan')
    supply_requests = db.relationship('SupplyRequest', back_populates='store_product', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'store_id': self.store_id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'created_at': self.created_at.strftime('%B %d, %Y') if self.created_at else None
        }