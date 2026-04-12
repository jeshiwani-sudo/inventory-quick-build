import pytest
from tests.conftest import create_test_user, create_test_merchant, get_token
from app import db


class TestMerchantRegistration:

    def test_register_merchant_success(self, client):
        response = client.post('/api/auth/register-merchant', json={
            'full_name': 'John Merchant',
            'email': 'john@gmail.com',
            'password': 'password123',
            'store_name': 'Johns Store'
        })
        assert response.status_code == 201
        data = response.get_json()
        assert 'access_token' in data
        assert 'store' in data
        assert data['user']['role'] == 'merchant'

    def test_register_merchant_duplicate_email(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='john@gmail.com')

        response = client.post('/api/auth/register-merchant', json={
            'full_name': 'John Again',
            'email': 'john@gmail.com',
            'password': 'password123',
            'store_name': 'Another Store'
        })
        assert response.status_code == 409
        assert 'already registered' in response.get_json()['error']

    def test_register_merchant_invalid_domain(self, client):
        response = client.post('/api/auth/register-merchant', json={
            'full_name': 'John Merchant',
            'email': 'john@hotmail.com',
            'password': 'password123',
            'store_name': 'Johns Store'
        })
        assert response.status_code == 400
        assert 'gmail.com' in response.get_json()['error']

    def test_register_merchant_missing_fields(self, client):
        response = client.post('/api/auth/register-merchant', json={
            'email': 'john@gmail.com',
            'password': 'password123'
        })
        assert response.status_code == 400
        assert 'Missing fields' in response.get_json()['error']

    def test_register_merchant_invalid_email(self, client):
        response = client.post('/api/auth/register-merchant', json={
            'full_name': 'John',
            'email': 'not-an-email',
            'password': 'password123',
            'store_name': 'Johns Store'
        })
        assert response.status_code == 400
        assert 'Invalid email' in response.get_json()['error']

    def test_new_merchant_gets_fresh_store(self, client, app):
        """New merchant should have empty store with no data"""
        response = client.post('/api/auth/register-merchant', json={
            'full_name': 'New Merchant',
            'email': 'new@gmail.com',
            'password': 'password123',
            'store_name': 'Brand New Store'
        })
        assert response.status_code == 201
        data = response.get_json()
        token = data['access_token']

        # Check summary shows zeros
        summary_res = client.get('/api/inventory/report/summary',
                                 headers={'Authorization': f'Bearer {token}'})
        assert summary_res.status_code == 200
        summary = summary_res.get_json()['summary']
        assert summary['total_items_received'] == 0
        assert summary['total_items_in_stock'] == 0
        assert summary['total_items_spoilt'] == 0

    def test_new_merchant_sees_only_own_store(self, client, app):
        """New merchant should only see their own store"""
        with app.app_context():
            create_test_merchant(email='other@gmail.com')

        response = client.post('/api/auth/register-merchant', json={
            'full_name': 'New Merchant',
            'email': 'new@gmail.com',
            'password': 'password123',
            'store_name': 'My Store'
        })
        token = response.get_json()['access_token']

        stores_res = client.get('/api/stores/',
                                headers={'Authorization': f'Bearer {token}'})
        assert stores_res.status_code == 200
        stores = stores_res.get_json()['stores']
        assert len(stores) == 1
        assert stores[0]['name'] == 'My Store'


class TestLogin:

    def test_login_success(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@gmail.com')

        response = client.post('/api/auth/login', json={
            'email': 'merchant@gmail.com',
            'password': 'password123'
        })
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert data['user']['role'] == 'merchant'

    def test_login_wrong_password(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@gmail.com')

        response = client.post('/api/auth/login', json={
            'email': 'merchant@gmail.com',
            'password': 'wrongpassword'
        })
        assert response.status_code == 401
        assert 'Invalid email or password' in response.get_json()['error']

    def test_login_wrong_email(self, client):
        response = client.post('/api/auth/login', json={
            'email': 'nobody@gmail.com',
            'password': 'password123'
        })
        assert response.status_code == 401

    def test_login_inactive_user(self, client, app):
        with app.app_context():
            user = create_test_user(role='clerk', email='clerk@gmail.com')
            user.is_active = False
            db.session.commit()

        response = client.post('/api/auth/login', json={
            'email': 'clerk@gmail.com',
            'password': 'password123'
        })
        assert response.status_code == 403
        assert 'suspended' in response.get_json()['error']

    def test_login_unverified_user(self, client, app):
        with app.app_context():
            user = create_test_user(role='admin', email='admin@gmail.com')
            user.is_verified = False
            db.session.commit()

        response = client.post('/api/auth/login', json={
            'email': 'admin@gmail.com',
            'password': 'password123'
        })
        assert response.status_code == 403
        assert 'verified' in response.get_json()['error']

    def test_login_missing_fields(self, client):
        response = client.post('/api/auth/login', json={
            'email': 'merchant@gmail.com'
        })
        assert response.status_code == 400

    def test_login_no_password_hash(self, client, app):
        """Invited user with no password set cannot login"""
        with app.app_context():
            user = create_test_user(role='admin', email='admin@gmail.com')
            user.password_hash = None
            db.session.commit()

        response = client.post('/api/auth/login', json={
            'email': 'admin@gmail.com',
            'password': 'password123'
        })
        assert response.status_code == 401


class TestInvite:

    def test_merchant_can_invite_admin(self, client, app):
        with app.app_context():
            merchant, store = create_test_merchant()
            store_id = store.id

        token = get_token(client, 'merchant@gmail.com')
        response = client.post('/api/auth/invite', json={
            'email': 'newadmin@gmail.com',
            'role': 'admin',
            'store_id': store_id
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code in [200, 201]

    def test_admin_can_invite_clerk(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='admin', email='admin@gmail.com',
                             store_id=store.id)

        token = get_token(client, 'admin@gmail.com')
        response = client.post('/api/auth/invite', json={
            'email': 'newclerk@gmail.com',
            'role': 'clerk'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code in [200, 201]

    def test_clerk_cannot_invite(self, client, app):
        with app.app_context():
            create_test_user(role='clerk', email='clerk@gmail.com')

        token = get_token(client, 'clerk@gmail.com')
        response = client.post('/api/auth/invite', json={
            'email': 'someone@gmail.com',
            'role': 'clerk'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403

    def test_invite_duplicate_email(self, client, app):
        with app.app_context():
            merchant, store = create_test_merchant()
            create_test_user(role='admin', email='existing@gmail.com',
                             store_id=store.id)
            store_id = store.id

        token = get_token(client, 'merchant@gmail.com')
        response = client.post('/api/auth/invite', json={
            'email': 'existing@gmail.com',
            'role': 'admin',
            'store_id': store_id
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 409

    def test_invite_invalid_role(self, client, app):
        with app.app_context():
            create_test_merchant()

        token = get_token(client, 'merchant@gmail.com')
        response = client.post('/api/auth/invite', json={
            'email': 'someone@gmail.com',
            'role': 'superuser'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400


class TestGetUsers:

    def test_merchant_sees_only_own_admins(self, client, app):
        with app.app_context():
            merchant, store = create_test_merchant()
            create_test_user(role='admin', email='admin1@gmail.com',
                             store_id=store.id)
            # Create another merchant's store and admin
            other_merchant, other_store = create_test_merchant(
                email='other@gmail.com'
            )
            create_test_user(role='admin', email='admin2@gmail.com',
                             store_id=other_store.id)

        token = get_token(client, 'merchant@gmail.com')
        response = client.get('/api/auth/users?role=admin',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        users = response.get_json()['users']
        emails = [u['email'] for u in users]
        assert 'admin1@gmail.com' in emails
        assert 'admin2@gmail.com' not in emails

    def test_admin_sees_only_own_store_clerks(self, client, app):
        with app.app_context():
            store1 = create_test_store('Store 1')
            store2 = create_test_store('Store 2')
            create_test_user(role='admin', email='admin@gmail.com',
                             store_id=store1.id)
            create_test_user(role='clerk', email='clerk1@gmail.com',
                             store_id=store1.id)
            create_test_user(role='clerk', email='clerk2@gmail.com',
                             store_id=store2.id)

        token = get_token(client, 'admin@gmail.com')
        response = client.get('/api/auth/users?role=clerk',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        users = response.get_json()['users']
        emails = [u['email'] for u in users]
        assert 'clerk1@gmail.com' in emails
        assert 'clerk2@gmail.com' not in emails

    def test_clerk_cannot_get_users(self, client, app):
        with app.app_context():
            create_test_user(role='clerk', email='clerk@gmail.com')

        token = get_token(client, 'clerk@gmail.com')
        response = client.get('/api/auth/users',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403


class TestUpdateProfile:

    def test_update_profile_success(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@gmail.com')

        token = get_token(client, 'merchant@gmail.com')
        response = client.put('/api/auth/profile', json={
            'full_name': 'Updated Name',
            'phone_number': '+254700000000'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['full_name'] == 'Updated Name'

    def test_update_profile_no_token(self, client):
        response = client.put('/api/auth/profile', json={
            'full_name': 'Updated Name'
        })
        assert response.status_code == 401


class TestChangePassword:

    def test_change_password_success(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@gmail.com')

        token = get_token(client, 'merchant@gmail.com')
        response = client.put('/api/auth/change-password', json={
            'current_password': 'password123',
            'new_password': 'newpassword456'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200

    def test_change_password_wrong_current(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@gmail.com')

        token = get_token(client, 'merchant@gmail.com')
        response = client.put('/api/auth/change-password', json={
            'current_password': 'wrongpassword',
            'new_password': 'newpassword456'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 401
        assert 'incorrect' in response.get_json()['error']