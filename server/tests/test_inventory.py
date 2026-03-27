import pytest
from tests.conftest import (
    create_test_user, create_test_store,
    create_test_product, get_token
)


class TestInventoryEntries:

    def test_create_entry_as_clerk(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='clerk', email='clerk@test.com',
                             store_id=store.id)
            product = create_test_product(store.id)
            product_id = product.id

        token = get_token(client, 'clerk@test.com')
        response = client.post('/api/inventory/', json={
            'product_id': product_id,
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
            create_test_user(role='admin', email='admin@test.com',
                             store_id=store.id)
            product = create_test_product(store.id)
            product_id = product.id

        token = get_token(client, 'admin@test.com')
        response = client.post('/api/inventory/', json={
            'product_id': product_id,
            'quantity_received': 100,
            'buying_price': 50.00,
            'selling_price': 75.00
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 403

    def test_create_entry_missing_fields(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='clerk', email='clerk@test.com',
                             store_id=store.id)

        token = get_token(client, 'clerk@test.com')
        response = client.post('/api/inventory/', json={
            'product_id': 1
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400

    def test_create_entry_negative_quantity(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='clerk', email='clerk@test.com',
                             store_id=store.id)
            product = create_test_product(store.id)
            product_id = product.id

        token = get_token(client, 'clerk@test.com')
        response = client.post('/api/inventory/', json={
            'product_id': product_id,
            'quantity_received': -5,
            'buying_price': 50.00,
            'selling_price': 75.00
        }, headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400

    def test_get_entries_paginated(self, client, app):
        with app.app_context():
            store = create_test_store()
            create_test_user(role='merchant', email='merchant@test.com')

        token = get_token(client, 'merchant@test.com')
        response = client.get('/api/inventory/?page=1&per_page=10',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = response.get_json()
        assert 'entries' in data
        assert 'total' in data
        assert 'pages' in data

    def test_get_summary_report(self, client, app):
        with app.app_context():
            create_test_user(role='merchant', email='merchant@test.com')

        token = get_token(client, 'merchant@test.com')
        response = client.get('/api/inventory/report/summary',
                              headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = response.get_json()
        assert 'summary' in data
        assert 'total_items_received' in data['summary']