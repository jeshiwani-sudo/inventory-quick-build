import pytest
from tests.conftest import create_test_user, get_token
from app import db


class TestAuthSetup:
    """Test merchant setup endpoint"""

    def test_setup_merchant_success(self, client):
        response = client.post('/api/auth/setup', json={
            'full_name': 'John Merchant',
            'email': 'merchant@test.com',
            'password': 'password123'
        })
        print(response.get_json())
        assert response.status_code == 201
        data = response.get_json()
        assert 'Merchant account created successfully' in data['message']

    def test_setup_merchant_duplicate(self, client):
        """Cannot create two merchants"""
        client.post('/api/auth/setup', json={
            'full_name': 'John Merchant',
            'email': 'merchant@test.com',
            'password': 'password123'
        })
        response = client.post('/api/auth/setup', json={
            'full_name': 'Jane Merchant',
            'email': 'merchant2@test.com',
            'password': 'password123'
        })
        assert response.status_code == 400
        assert 'already exists' in response.get_json()['error']

    def test_setup_missing_fields(self, client):
        response = client.post('/api/auth/setup', json={
            'email': 'merchant@test.com'
        })
        assert response.status_code == 400
        assert 'Missing fields' in response.get_json()['error']

    def test_setup_invalid_email(self, client):
        response = client.post('/api/auth/setup', json={
            'full_name': 'John',
            'email': 'not-an-email',
            'password': 'password123'
        })
        assert response.status_code == 400
        assert 'Invalid email' in response.get_json()['error']

    def test_setup_short_password(self, client):
        response = client.post('/api/auth/setup', json={
            'full_name': 'John',
            'email': 'merchant@test.com',
            'password': '123'
        })
        assert response.status_code == 400
        assert 'at least 6 characters' in response.get_json()['error']


class TestLogin:
    """Test login endpoint"""

    def test_login_success(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')

        response = client.post('/api/auth/login', json={
            'email': 'merchant@test.com',
            'password': 'password123'
        })
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert 'Welcome back' in data['message']

    def test_login_wrong_password(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')

        response = client.post('/api/auth/login', json={
            'email': 'merchant@test.com',
            'password': 'wrongpassword'
        })
        assert response.status_code == 401
        assert 'Invalid email or password' in response.get_json()['error']

    def test_login_wrong_email(self, client):
        response = client.post('/api/auth/login', json={
            'email': 'nobody@test.com',
            'password': 'password123'
        })
        assert response.status_code == 401

    def test_login_inactive_user(self, client, app):
        with app.app_context():
            user = create_test_user(role='clerk', email='clerk@test.com')
            user.is_active = False
            db.session.commit()

        response = client.post('/api/auth/login', json={
            'email': 'clerk@test.com',
            'password': 'password123'
        })
        assert response.status_code == 403
        assert 'deactivated' in response.get_json()['error']

    def test_login_missing_fields(self, client):
        response = client.post('/api/auth/login', json={
            'email': 'merchant@test.com'
        })
        assert response.status_code == 400


class TestGetCurrentUser:
    """Test /me endpoint"""

    def test_get_current_user_success(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')
        token = get_token(client, 'merchant@test.com')

        response = client.get('/api/auth/me', headers={
            'Authorization': f'Bearer {token}'
        })
        assert response.status_code == 200
        assert 'user' in response.get_json()

    def test_get_current_user_no_token(self, client):
        response = client.get('/api/auth/me')
        assert response.status_code == 401