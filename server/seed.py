from app import create_app, db
from app.models.user import User
from app.models.store import Store
from app.models.product import Product
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
        print("🗑️  Clearing existing data...")
        SupplyRequest.query.delete()
        InventoryEntry.query.delete()
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
        # CREATE USERS
        # -----------------------------------------------
        print("👥 Creating users...")

        # Merchant (no store — sees everything)
        merchant = User(
            full_name="James Mwangi",
            email="merchant@test.com",
            password_hash=hash_password("password123"),
            role="merchant",
            is_active=True,
            is_verified=True,
            store_id=None
        )

        # Admins (one per store)
        admin1 = User(
            full_name="Admin One",
            email="admin1@test.com",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True,
            is_verified=True,
            store_id=store1.id
        )
        admin2 = User(
            full_name="Admin Two",
            email="admin2@test.com",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True,
            is_verified=True,
            store_id=store2.id
        )
        admin3 = User(
            full_name="Admin Three",
            email="admin3@test.com",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True,
            is_verified=True,
            store_id=store3.id
        )

        # Clerks (two per store)
        clerk1 = User(
            full_name="Clerk One",
            email="clerk1@test.com",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store1.id
        )
        clerk2 = User(
            full_name="Clerk Two",
            email="clerk2@test.com",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store1.id
        )
        clerk3 = User(
            full_name="Clerk Three",
            email="clerk3@test.com",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store2.id
        )
        clerk4 = User(
            full_name="Clerk Four",
            email="clerk4@test.com",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store2.id
        )
        clerk5 = User(
            full_name="Clerk Five",
            email="clerk5@test.com",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store3.id
        )
        clerk6 = User(
            full_name="Clerk Six",
            email="clerk6@test.com",
            password_hash=hash_password("password123"),
            role="clerk",
            is_active=True,
            is_verified=True,
            store_id=store3.id
        )

        db.session.add_all([
            merchant,
            admin1, admin2, admin3,
            clerk1, clerk2, clerk3, clerk4, clerk5, clerk6
        ])
        db.session.commit()

        # -----------------------------------------------
        # CREATE PRODUCTS
        # -----------------------------------------------
        print("📦 Creating products...")

        store1_products = [
            Product(name="Sugar 1kg", description="White refined sugar", store_id=store1.id),
            Product(name="Maize Flour 2kg", description="Unga wa mahindi", store_id=store1.id),
            Product(name="Cooking Oil 1L", description="Refined sunflower oil", store_id=store1.id),
            Product(name="Rice 5kg", description="Long grain white rice", store_id=store1.id),
            Product(name="Milk 500ml", description="Fresh whole milk", store_id=store1.id),
        ]
        store2_products = [
            Product(name="Bread Loaf", description="Sliced white bread", store_id=store2.id),
            Product(name="Eggs (tray)", description="30 eggs per tray", store_id=store2.id),
            Product(name="Butter 250g", description="Salted butter", store_id=store2.id),
            Product(name="Tea Leaves 100g", description="Kenyan loose tea", store_id=store2.id),
            Product(name="Salt 1kg", description="Iodized table salt", store_id=store2.id),
        ]
        store3_products = [
            Product(name="Tomatoes 1kg", description="Fresh red tomatoes", store_id=store3.id),
            Product(name="Onions 1kg", description="Yellow onions", store_id=store3.id),
            Product(name="Beef 1kg", description="Fresh minced beef", store_id=store3.id),
            Product(name="Chicken (whole)", description="Fresh dressed chicken", store_id=store3.id),
            Product(name="Potatoes 2kg", description="Irish potatoes", store_id=store3.id),
        ]

        all_products = store1_products + store2_products + store3_products
        db.session.add_all(all_products)
        db.session.commit()

        # -----------------------------------------------
        # CREATE INVENTORY ENTRIES
        # -----------------------------------------------
        print("📋 Creating inventory entries...")

        # Map clerks to their store products
        clerk_product_map = [
            (clerk1, store1_products),
            (clerk2, store1_products),
            (clerk3, store2_products),
            (clerk4, store2_products),
            (clerk5, store3_products),
            (clerk6, store3_products),
        ]

        entries = []
        payment_options = ['paid', 'unpaid']

        for clerk, products in clerk_product_map:
            for product in products:
                # Create 2 entries per product per clerk over the last 7 days
                for days_ago in [random.randint(0, 7), random.randint(0, 7)]:
                    qty_received = random.randint(50, 200)
                    qty_spoilt = random.randint(0, 10)
                    qty_in_stock = qty_received - qty_spoilt
                    buying_price = round(random.uniform(20.0, 500.0), 2)
                    selling_price = round(buying_price * random.uniform(1.1, 1.5), 2)

                    entry = InventoryEntry(
                        product_id=product.id,
                        clerk_id=clerk.id,
                        quantity_received=qty_received,
                        quantity_in_stock=qty_in_stock,
                        quantity_spoilt=qty_spoilt,
                        buying_price=buying_price,
                        selling_price=selling_price,
                        payment_status=random.choice(payment_options),
                        recorded_at=datetime.utcnow() - timedelta(days=days_ago)
                    )
                    entries.append(entry)

        db.session.add_all(entries)
        db.session.commit()

        # -----------------------------------------------
        # CREATE SUPPLY REQUESTS
        # -----------------------------------------------
        print("🚚 Creating supply requests...")

        status_options = ['pending', 'approved', 'declined']

        supply_requests = []
        for clerk, products in clerk_product_map:
            for product in random.sample(products, k=2):  # 2 requests per clerk
                supply_requests.append(SupplyRequest(
                    product_id=product.id,
                    clerk_id=clerk.id,
                    store_id=clerk.store_id,
                    quantity_requested=random.randint(10, 100),
                    status=random.choice(status_options),
                    note=random.choice([
                        "Running low on stock",
                        "High demand this week",
                        "Stock finished earlier than expected",
                        "Restocking for the weekend",
                        None
                    ]),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 5))
                ))

        db.session.add_all(supply_requests)
        db.session.commit()

        # -----------------------------------------------
        # DONE
        # -----------------------------------------------
        print("")
        print("✅ Database seeded successfully!")
        print("")
        print("=" * 45)
        print("🔐 LOGIN CREDENTIALS (all use password123)")
        print("=" * 45)
        print("")
        print("👑 MERCHANT")
        print("   Email:    merchant@test.com")
        print("   Password: password123")
        print("")
        print("👔 ADMINS")
        print("   admin1@test.com  → Nairobi CBD Branch")
        print("   admin2@test.com  → Westlands Branch")
        print("   admin3@test.com  → Mombasa Branch")
        print("")
        print("📝 CLERKS")
        print("   clerk1@test.com  → Nairobi CBD Branch")
        print("   clerk2@test.com  → Nairobi CBD Branch")
        print("   clerk3@test.com  → Westlands Branch")
        print("   clerk4@test.com  → Westlands Branch")
        print("   clerk5@test.com  → Mombasa Branch")
        print("   clerk6@test.com  → Mombasa Branch")
        print("")
        print("   All clerk passwords: password123")
        print("=" * 45)

if __name__ == '__main__':
    seed()