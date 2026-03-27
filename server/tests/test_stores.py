import pytest
from tests.conftest import create_test_user, create_test_store, get_token


class TestStores:

    def test_create_store_as_merchant(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')
        token = get_token(client, 'merchant@test.com')

        response = client.post('/api/stores/', json={
            'name': 'Main Branch',
            'location': 'Nairobi'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 201
        assert 'Store created successfully' in response.get_json()['message']

    def test_create_store_as_clerk_forbidden(self, client, app):
        with app.app_context():
            create_test_user(role='clerk', email='clerk@test.com')
        token = get_token(client, 'clerk@test.com')

        response = client.post('/api/stores/', json={
            'name': 'Main Branch'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403

    def test_create_store_missing_name(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')
        token = get_token(client, 'merchant@test.com')

        response = client.post('/api/stores/', json={
            'location': 'Nairobi'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400

    def test_get_stores_as_merchant(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')
            create_test_store('Store 1')
            create_test_store('Store 2')
        token = get_token(client, 'merchant@test.com')

        response = client.get('/api/stores/', headers={
            'Authorization': f'Bearer {token}'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['total'] == 2

    def test_get_store_not_found(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')
        token = get_token(client, 'merchant@test.com')

        response = client.get('/api/stores/999', headers={
            'Authorization': f'Bearer {token}'
        })

        assert response.status_code == 404

    def test_delete_store_as_merchant(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')
            store = create_test_store()
            store_id = store.id

        token = get_token(client, 'merchant@test.com')
        response = client.delete(f'/api/stores/{store_id}', headers={
            'Authorization': f'Bearer {token}'
        })

        assert response.status_code == 200