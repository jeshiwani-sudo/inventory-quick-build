import pytest
from app import create_app, db
from app.models.user import User
from app.models.store import Store
from app.models.product import Product
from app.models.store_product import StoreProduct
import bcrypt


@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False,
        'MAIL_BACKEND': 'locmem',  # Use in-memory mail backend for tests
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()


# -----------------------------------------------
# HELPER: Create test store (with optional merchant)
# -----------------------------------------------
def create_test_store(name='Test Store', merchant_id=None):
    store = Store(
        name=name,
        location='Nairobi',
        merchant_id=merchant_id
    )
    db.session.add(store)
    db.session.commit()
    return store


# -----------------------------------------------
# HELPER: Create test users
# -----------------------------------------------
def create_test_user(role='clerk', email=None, store_id=None):
    hashed = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())
    user = User(
        full_name=f'Test {role.capitalize()}',
        email=email or f'{role}@test.com',
        password_hash=hashed.decode('utf-8'),
        role=role,
        is_active=True,
        is_verified=True,
        store_id=store_id
    )
    db.session.add(user)
    db.session.commit()
    return user


# -----------------------------------------------
# HELPER: Create merchant with their own store
# -----------------------------------------------
def create_test_merchant(email='merchant@gmail.com'):
    store = Store(name='Test Merchant Store', location='Nairobi')
    db.session.add(store)
    db.session.flush()

    hashed = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())
    merchant = User(
        full_name='Test Merchant',
        email=email,
        password_hash=hashed.decode('utf-8'),
        role='merchant',
        is_active=True,
        is_verified=True,
        store_id=store.id
    )
    db.session.add(merchant)
    db.session.flush()

    # Link store to merchant
    store.merchant_id = merchant.id
    db.session.commit()

    return merchant, store


# -----------------------------------------------
# HELPER: Create product and link to store via StoreProduct
# -----------------------------------------------
def create_test_product(store_id, name='Test Product'):
    product = Product(
        name=name,
        description='A test product'
    )
    db.session.add(product)
    db.session.flush()

    store_product = StoreProduct(
        store_id=store_id,
        product_id=product.id
    )
    db.session.add(store_product)
    db.session.commit()

    return store_product  # Return StoreProduct since inventory uses store_product_id


# -----------------------------------------------
# HELPER: Get auth token
# -----------------------------------------------
def get_token(client, email, password='password123'):
    response = client.post('/api/auth/login', json={
        'email': email,
        'password': password
    })
    return response.get_json().get('access_token')