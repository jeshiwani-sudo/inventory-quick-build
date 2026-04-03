from app import db
from datetime import datetime

class Store(db.Model):
    __tablename__ = 'stores'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    users = db.relationship('User', back_populates='store', cascade='all, delete-orphan')
    supply_requests = db.relationship('SupplyRequest', back_populates='store', cascade='all, delete-orphan')
    
    # Changed for new store_products junction table: added relationship to junction table
    store_products = db.relationship('StoreProduct', back_populates='store', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%B %d, %Y') if self.created_at else None
        }
