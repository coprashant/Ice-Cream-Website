
from django.contrib.auth.hashers import make_password
from rest_framework.test         import APIClient
from rest_framework              import status
from django.test                 import TestCase

from .models import Business, User, Order, OrderItem, AdminLog

class BaseTestCase(TestCase):
    """Creates shared test data used across all test classes."""

    def setUp(self):
        self.client = APIClient()
        
        self.business = Business.objects.create(
            name    = 'Sunny Scoops Ltd',
            email   = 'sunny@scoops.com',
            phone   = '555-1234',
        )

        # Create an admin user
        self.admin = User.objects.create(
            username      = 'admin',
            password_hash = make_password('adminpass'),
            role          = User.Role.ADMIN,
            business      = None,
        )

        # Create a business customer
        self.customer = User.objects.create(
            username      = 'sunny_user',
            password_hash = make_password('customerpass'),
            role          = User.Role.CUSTOMER,
            business      = self.business,
        )

    def auth_header(self, user):
        """Returns the X-User-Id header dict for a given user."""
        return {'HTTP_X_USER_ID': str(user.id)}


class LoginTests(BaseTestCase):

    def test_login_success_admin(self):
        response = self.client.post('/api/auth/login', {
            'username': 'admin',
            'password': 'adminpass',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'admin')
        self.assertEqual(response.data['role'], 'ADMIN')
        self.assertNotIn('password_hash', response.data)

    def test_login_success_customer(self):
        response = self.client.post('/api/auth/login', {
            'username': 'sunny_user',
            'password': 'customerpass',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'CUSTOMER')

    def test_login_wrong_password(self):
        response = self.client.post('/api/auth/login', {
            'username': 'admin',
            'password': 'wrongpassword',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_unknown_user(self):
        response = self.client.post('/api/auth/login', {
            'username': 'nobody',
            'password': 'anything',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        response = self.client.post('/api/auth/login', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PlaceOrderTests(BaseTestCase):

    def _order_payload(self, business_id=None):
        return {
            'business': business_id or self.business.id,
            'items': [
                {'item_name': 'Vanilla Tub',  'quantity': 2, 'price': '4.50'},
                {'item_name': 'Choc Scoop',   'quantity': 5, 'price': '1.20'},
            ],
        }

    def test_place_order_success(self):
        response = self.client.post('/api/orders/place', self._order_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['items']), 2)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 2)

    def test_place_order_calculates_total(self):
        response = self.client.post('/api/orders/place', self._order_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # (2 × 4.50) + (5 × 1.20) = 9.00 + 6.00 = 15.00
        self.assertEqual(float(response.data['total_amount']), 15.00)

    def test_place_order_requires_items(self):
        payload = {'business': self.business.id, 'items': []}
        response = self.client.post('/api/orders/place', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_place_order_invalid_quantity(self):
        payload = {
            'business': self.business.id,
            'items': [{'item_name': 'Vanilla', 'quantity': 0, 'price': '4.50'}],
        }
        response = self.client.post('/api/orders/place', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UpdateOrderStatusTests(BaseTestCase):

    def setUp(self):
        super().setUp()
        # Create a pre-existing order to update
        self.order = Order.objects.create(
            business     = self.business,
            total_amount = 15.00,
        )

    def test_admin_can_update_status(self):
        response = self.client.patch(
            f'/api/orders/{self.order.id}/status',
            {'status': 'Confirmed'},
            format='json',
            **self.auth_header(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'Confirmed')
        self.assertTrue(response.data['email_sent'])

    def test_customer_cannot_update_status(self):
        response = self.client.patch(
            f'/api/orders/{self.order.id}/status',
            {'status': 'Confirmed'},
            format='json',
            **self.auth_header(self.customer),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_status_rejected(self):
        response = self.client.patch(
            f'/api/orders/{self.order.id}/status',
            {'status': 'Flying'},
            format='json',
            **self.auth_header(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_status_change_is_logged(self):
        self.client.patch(
            f'/api/orders/{self.order.id}/status',
            {'status': 'Confirmed'},
            format='json',
            **self.auth_header(self.admin),
        )
        self.assertEqual(AdminLog.objects.filter(admin_user=self.admin).count(), 1)


class AdminLogTests(BaseTestCase):

    def test_admin_can_view_logs(self):
        AdminLog.record(self.admin, 'Test action')
        response = self.client.get('/api/admin/logs/', **self.auth_header(self.admin))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_customer_cannot_view_logs(self):
        response = self.client.get('/api/admin/logs/', **self.auth_header(self.customer))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)