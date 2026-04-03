from app import create_app, db
from app.models.user import User
from app.models.store import Store
from app.models.product import Product
from app.models.store_product import StoreProduct
from app.models.inventory_entry import InventoryEntry
from app.models.supply_request import SupplyRequest
import bcrypt
from datetime import datetime, timedelta
import random

app = create_app()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed():
    with app.app_context():
        # -----------------------------------------------
        # CLEAR EXISTING DATA (in correct order)
        # -----------------------------------------------
        print("🗑️ Clearing existing data...")
        SupplyRequest.query.delete()
        InventoryEntry.query.delete()
        StoreProduct.query.delete()
        Product.query.delete()
        User.query.delete()
        Store.query.delete()
        db.session.commit()

        # -----------------------------------------------
        # CREATE STORES
        # -----------------------------------------------
        print("🏪 Creating stores...")
        store1 = Store(name="Nairobi CBD Branch", location="Nairobi CBD, Moi Avenue")
        store2 = Store(name="Westlands Branch", location="Westlands, Waiyaki Way")
        store3 = Store(name="Mombasa Branch", location="Mombasa, Nyali Road")

        db.session.add_all([store1, store2, store3])
        db.session.commit()

        # -----------------------------------------------
        # CREATE USERS (All passwords = password123)
        # -----------------------------------------------
        print("👥 Creating users...")
        # Merchant
        merchant = User(
            full_name="James Mwangi",
            email="merchant@test.com",
            phone_number="+254 712 345 678",
            password_hash=hash_password("password123"),
            role="merchant",
            is_active=True,
            is_verified=True,
            store_id=None
        )
        # Admins
        admin1 = User(
            full_name="Admin One",
            email="admin1@test.com",
            phone_number="+254 723 456 789",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True,
            is_verified=True,
            store_id=store1.id
        )
        admin2 = User(
            full_name="Admin Two",
            email="admin2@test.com",
            phone_number="+254 734 567 890",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True,
            is_verified=True,
            store_id=store2.id
        )
        admin3 = User(
            full_name="Admin Three",
            email="admin3@test.com",
            phone_number="+254 745 678 901",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True,
            is_verified=True,
            store_id=store3.id
        )
        # Clerks
        clerk1 = User(
            full_name="Clerk One",
            email="clerk1@test.com",
            phone_number="+254 756 789 012",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store1.id
        )
        clerk2 = User(
            full_name="Clerk Two",
            email="clerk2@test.com",
            phone_number="+254 767 890 123",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store1.id
        )
        clerk3 = User(
            full_name="Clerk Three",
            email="clerk3@test.com",
            phone_number="+254 778 901 234",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store2.id
        )
        clerk4 = User(
            full_name="Clerk Four",
            email="clerk4@test.com",
            phone_number="+254 789 012 345",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store2.id
        )
        clerk5 = User(
            full_name="Clerk Five",
            email="clerk5@test.com",
            phone_number="+254 790 123 456",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store3.id
        )
        clerk6 = User(
            full_name="Clerk Six",
            email="clerk6@test.com",
            phone_number="+254 701 234 567",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store3.id
        )

        db.session.add_all([
            merchant, admin1, admin2, admin3,
            clerk1, clerk2, clerk3, clerk4, clerk5, clerk6
        ])
        db.session.commit()

        # -----------------------------------------------
        # CREATE GLOBAL PRODUCTS
        # -----------------------------------------------
        print("📦 Creating global products...")
        products_data = [
            ("Sugar 1kg", "White refined sugar"),
            ("Maize Flour 2kg", "Unga wa mahindi"),
            ("Cooking Oil 1L", "Refined sunflower oil"),
            ("Rice 5kg", "Long grain white rice"),
            ("Milk 500ml", "Fresh whole milk"),
            ("Bread Loaf", "Sliced white bread"),
            ("Eggs (tray)", "30 eggs per tray"),
            ("Butter 250g", "Salted butter"),
            ("Tea Leaves 100g", "Kenyan loose tea"),
            ("Salt 1kg", "Iodized table salt"),
            ("Tomatoes 1kg", "Fresh red tomatoes"),
            ("Onions 1kg", "Yellow onions"),
            ("Beef 1kg", "Fresh minced beef"),
            ("Chicken (whole)", "Fresh dressed chicken"),
            ("Potatoes 2kg", "Irish potatoes"),
        ]

        all_products = []
        for name, desc in products_data:
            product = Product(name=name, description=desc)
            all_products.append(product)

        db.session.add_all(all_products)
        db.session.commit()

        # -----------------------------------------------
        # LINK PRODUCTS TO STORES via StoreProduct junction table
        # -----------------------------------------------
        print("🔗 Linking products to stores via junction table...")
        for product in all_products:
            sp1 = StoreProduct(store_id=store1.id, product_id=product.id)
            sp2 = StoreProduct(store_id=store2.id, product_id=product.id)
            sp3 = StoreProduct(store_id=store3.id, product_id=product.id)
            db.session.add_all([sp1, sp2, sp3])

        db.session.commit()

        # -----------------------------------------------
        # CREATE INVENTORY ENTRIES (using store_product_id)
        # -----------------------------------------------
        print("📋 Creating inventory entries...")
        clerk_product_map = [
            (clerk1, store1.id),
            (clerk2, store1.id),
            (clerk3, store2.id),
            (clerk4, store2.id),
            (clerk5, store3.id),
            (clerk6, store3.id),
        ]

        entries = []
        payment_options = ['paid', 'unpaid']

        for clerk, store_id in clerk_product_map:
            # Get StoreProduct links for this store
            store_products = StoreProduct.query.filter_by(store_id=store_id).all()
            for sp in store_products:
                for _ in range(2):  # 2 entries per product
                    qty_received = random.randint(50, 200)
                    qty_spoilt = random.randint(0, 12)
                    qty_in_stock = qty_received - qty_spoilt
                    buying_price = round(random.uniform(20.0, 500.0), 2)
                    selling_price = round(buying_price * random.uniform(1.1, 1.6), 2)

                    entry = InventoryEntry(
                        store_product_id=sp.id,
                        clerk_id=clerk.id,
                        quantity_received=qty_received,
                        quantity_in_stock=qty_in_stock,
                        quantity_spoilt=qty_spoilt,
                        buying_price=buying_price,
                        selling_price=selling_price,
                        payment_status=random.choice(payment_options),
                        recorded_at=datetime.utcnow() - timedelta(days=random.randint(0, 10))
                    )
                    entries.append(entry)

        db.session.add_all(entries)
        db.session.commit()

        # -----------------------------------------------
        # CREATE SUPPLY REQUESTS (using store_product_id)
        # -----------------------------------------------
        print("🚚 Creating supply requests...")
        status_options = ['pending', 'approved', 'declined']
        supply_requests = []

        for clerk, store_id in clerk_product_map:
            store_products = StoreProduct.query.filter_by(store_id=store_id).all()
            for sp in random.sample(store_products, k=min(2, len(store_products))):
                supply_requests.append(SupplyRequest(
                    store_product_id=sp.id,
                    clerk_id=clerk.id,
                    store_id=store_id,
                    quantity_requested=random.randint(10, 100),
                    status=random.choice(status_options),
                    note=random.choice([
                        "Running low on stock",
                        "High demand this week",
                        "Stock finished earlier than expected",
                        "Restocking for the weekend",
                        None
                    ]),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 7))
                ))

        db.session.add_all(supply_requests)
        db.session.commit()

        # -----------------------------------------------
        # DONE
        # -----------------------------------------------
        print("\n✅ Database seeded successfully with new store_products junction table!\n")
        print("=" * 60)
        print("🔐 ALL ACCOUNTS USE THE SAME PASSWORD: password123")
        print("=" * 60)
        print("\n👑 MERCHANT")
        print("   Email: merchant@test.com")
        print("   Password: password123\n")
        print("👔 ADMINS")
        print("   admin1@test.com → Nairobi CBD Branch")
        print("   admin2@test.com → Westlands Branch")
        print("   admin3@test.com → Mombasa Branch\n")
        print("📝 CLERKS")
        print("   clerk1@test.com → Nairobi CBD Branch")
        print("   clerk2@test.com → Nairobi CBD Branch")
        print("   clerk3@test.com → Westlands Branch")
        print("   clerk4@test.com → Westlands Branch")
        print("   clerk5@test.com → Mombasa Branch")
        print("   clerk6@test.com → Mombasa Branch\n")
        print("=" * 60)

if __name__ == '__main__':
    seed()
