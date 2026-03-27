import pytest
from app import create_app, db
from app.models.user import User
from app.models.store import Store
from app.models.product import Product
import bcrypt

@pytest.fixture
def app():
    """Create a test version of the app"""
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client"""
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()


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


def create_test_store(name='Test Store'):
    store = Store(name=name, location='Nairobi')
    db.session.add(store)
    db.session.commit()
    return store


def create_test_product(store_id, name='Test Product'):
    product = Product(
        name=name,
        description='A test product',
        store_id=store_id
    )
    db.session.add(product)
    db.session.commit()
    return product


# -----------------------------------------------
# HELPER: Get auth token for a user
# -----------------------------------------------
def get_token(client, email, password='password123'):
    response = client.post('/api/auth/login', json={
        'email': email,
        'password': password
    })
    return response.get_json().get('access_token')