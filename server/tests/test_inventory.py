import pytest
from tests.conftest import (
    create_test_user, create_test_store,
    create_test_product, create_test_merchant, get_token
)


class TestInventoryEntries:

    def test_create_entry_as_clerk(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='clerk', email='clerk@gmail.com',
                             store_id=store.id)
            store_product = create_test_product(store.id)
            store_product_id = store_product.id

        token = get_token(client, 'clerk@gmail.com')
        response = client.post('/api/inventory/', json={
            'store_product_id': store_product_id,
            'quantity_received': 100,
            'quantity_in_stock': 95,
            'quantity_spoilt': 5,
            'buying_price': 50.00,
            'selling_price': 75.00,
            'payment_status': 'unpaid'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 201
        assert 'recorded successfully' in response.get_json()['message']

    def test_create_entry_as_admin_forbidden(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='admin', email='admin@gmail.com',
                             store_id=store.id)
            store_product = create_test_product(store.id)
            store_product_id = store_product.id

        token = get_token(client, 'admin@gmail.com')
        response = client.post('/api/inventory/', json={
            'store_product_id': store_product_id,
            'quantity_received': 100,
            'buying_price': 50.00,
            'selling_price': 75.00
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403

    def test_create_entry_missing_fields(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='clerk', email='clerk@gmail.com',
                             store_id=store.id)

        token = get_token(client, 'clerk@gmail.com')
        response = client.post('/api/inventory/', json={
            'store_product_id': 1
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400

    def test_get_entries_as_merchant(self, client, app):
        with app.app_context():
            create_test_merchant()

        token = get_token(client, 'merchant@gmail.com')
        response = client.get('/api/inventory/?page=1&per_page=10',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = response.get_json()
        assert 'entries' in data
        assert 'total' in data
        assert 'pages' in data

    def test_get_entries_as_admin(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='admin', email='admin@gmail.com',
                             store_id=store.id)

        token = get_token(client, 'admin@gmail.com')
        response = client.get('/api/inventory/',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200

    def test_get_my_entries_as_clerk(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='clerk', email='clerk@gmail.com',
                             store_id=store.id)

        token = get_token(client, 'clerk@gmail.com')
        response = client.get('/api/inventory/my-entries',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        assert 'entries' in response.get_json()

    def test_get_my_entries_as_admin_forbidden(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='admin', email='admin@gmail.com',
                             store_id=store.id)

        token = get_token(client, 'admin@gmail.com')
        response = client.get('/api/inventory/my-entries',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403

    def test_get_summary_report_as_merchant(self, client, app):
        with app.app_context():
            create_test_merchant()

        token = get_token(client, 'merchant@gmail.com')
        response = client.get('/api/inventory/report/summary',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = response.get_json()
        assert 'summary' in data
        assert 'total_items_received' in data['summary']
        assert 'total_items_in_stock' in data['summary']
        assert 'total_items_spoilt' in data['summary']

    def test_new_merchant_summary_is_zero(self, client, app):
        with app.app_context():
            create_test_merchant()

        token = get_token(client, 'merchant@gmail.com')
        response = client.get('/api/inventory/report/summary',
                              headers={'Authorization': f'Bearer {token}'})

        summary = response.get_json()['summary']
        assert summary['total_items_received'] == 0
        assert summary['total_items_in_stock'] == 0
        assert summary['total_items_spoilt'] == 0
        assert summary['total_unpaid_amount'] == 0

    def test_update_payment_status(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='admin', email='admin@gmail.com',
                             store_id=store.id)
            clerk = create_test_user(role='clerk', email='clerk@gmail.com',
                                     store_id=store.id)
            store_product = create_test_product(store.id)

            from app.models.inventory_entry import InventoryEntry
            from app import db
            entry = InventoryEntry(
                store_product_id=store_product.id,
                clerk_id=clerk.id,
                quantity_received=100,
                quantity_in_stock=100,
                quantity_spoilt=0,
                buying_price=50.0,
                selling_price=75.0,
                payment_status='unpaid'
            )
            db.session.add(entry)
            db.session.commit()
            entry_id = entry.id

        token = get_token(client, 'admin@gmail.com')
        response = client.patch(f'/api/inventory/{entry_id}/payment', json={
            'payment_status': 'paid'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        assert 'paid' in response.get_json()['message']

    def test_update_payment_status_as_clerk_forbidden(self, client, app):
        with app.app_context():
            store = create_test_store()
            clerk = create_test_user(role='clerk', email='clerk@gmail.com',
                                     store_id=store.id)
            store_product = create_test_product(store.id)

            from app.models.inventory_entry import InventoryEntry
            from app import db
            entry = InventoryEntry(
                store_product_id=store_product.id,
                clerk_id=clerk.id,
                quantity_received=50,
                quantity_in_stock=50,
                quantity_spoilt=0,
                buying_price=30.0,
                selling_price=45.0,
                payment_status='unpaid'
            )
            db.session.add(entry)
            db.session.commit()
            entry_id = entry.id

        token = get_token(client, 'clerk@gmail.com')
        response = client.patch(f'/api/inventory/{entry_id}/payment', json={
            'payment_status': 'paid'
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403