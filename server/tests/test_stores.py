import pytest
from tests.conftest import (
    create_test_user, create_test_store,
    create_test_merchant, get_token
)


class TestStores:

    def test_create_store_as_merchant(self, client, app):
        with app.app_context():
            create_test_merchant()

        token = get_token(client, 'merchant@gmail.com')
        response = client.post('/api/stores/', json={
            'name': 'Main Branch',
            'location': 'Nairobi'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 201
        assert 'created' in response.get_json()['message']

    def test_create_store_as_clerk_forbidden(self, client, app):
        with app.app_context():
            create_test_user(role='clerk', email='clerk@gmail.com')

        token = get_token(client, 'clerk@gmail.com')
        response = client.post('/api/stores/', json={
            'name': 'Main Branch'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403

    def test_create_store_as_admin_forbidden(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='admin', email='admin@gmail.com',
                             store_id=store.id)

        token = get_token(client, 'admin@gmail.com')
        response = client.post('/api/stores/', json={
            'name': 'New Branch'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403

    def test_create_store_missing_name(self, client, app):
        with app.app_context():
            create_test_merchant()

        token = get_token(client, 'merchant@gmail.com')
        response = client.post('/api/stores/', json={
            'location': 'Nairobi'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400

    def test_get_stores_merchant_sees_only_own(self, client, app):
        with app.app_context():
            merchant, store = create_test_merchant()
            # Another merchant's store
            other_merchant, other_store = create_test_merchant(
                email='other@gmail.com'
            )

        token = get_token(client, 'merchant@gmail.com')
        response = client.get('/api/stores/',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        stores = response.get_json()['stores']
        store_names = [s['name'] for s in stores]
        assert 'Test Merchant Store' in store_names
        assert len(stores) == 1

    def test_get_stores_admin_sees_only_own(self, client, app):
        with app.app_context():
            store = create_test_store('Admin Store')
            create_test_user(role='admin', email='admin@gmail.com',
                             store_id=store.id)

        token = get_token(client, 'admin@gmail.com')
        response = client.get('/api/stores/',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        stores = response.get_json()['stores']
        assert len(stores) == 1
        assert stores[0]['name'] == 'Admin Store'

    def test_update_store_as_merchant(self, client, app):
        with app.app_context():
            merchant, store = create_test_merchant()
            store_id = store.id

        token = get_token(client, 'merchant@gmail.com')
        response = client.put(f'/api/stores/{store_id}', json={
            'name': 'Updated Store Name',
            'location': 'Mombasa'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        assert 'updated' in response.get_json()['message']

    def test_update_store_not_owned(self, client, app):
        with app.app_context():
            create_test_merchant()
            other_merchant, other_store = create_test_merchant(
                email='other@gmail.com'
            )
            other_store_id = other_store.id

        token = get_token(client, 'merchant@gmail.com')
        response = client.put(f'/api/stores/{other_store_id}', json={
            'name': 'Hacked Store'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 404

    def test_delete_store_as_merchant(self, client, app):
        with app.app_context():
            merchant, store = create_test_merchant()
            # Create a second store to delete
            from app.models.store import Store
            from app import db
            extra_store = Store(
                name='Extra Store',
                location='Kisumu',
                merchant_id=merchant.id
            )
            db.session.add(extra_store)
            db.session.commit()
            extra_store_id = extra_store.id

        token = get_token(client, 'merchant@gmail.com')
        response = client.delete(f'/api/stores/{extra_store_id}',
                                 headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200

    def test_delete_store_not_owned(self, client, app):
        with app.app_context():
            create_test_merchant()
            other_merchant, other_store = create_test_merchant(
                email='other@gmail.com'
            )
            other_store_id = other_store.id

        token = get_token(client, 'merchant@gmail.com')
        response = client.delete(f'/api/stores/{other_store_id}',
                                 headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 404