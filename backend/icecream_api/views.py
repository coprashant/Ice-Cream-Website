from django.contrib.auth.hashers import check_password, make_password
from rest_framework.views     import APIView
from rest_framework.response  import Response
from rest_framework           import status

from .models       import User, Order, Business, AdminLog
from .serializers  import (
    UserSerializer,
    OrderSerializer,
    BusinessSerializer,
    AdminLogSerializer,
)

# Helper

def get_user_from_request(request):
    """
    Reads 'X-User-Id' from request headers and returns the User object.
    Returns None if the header is missing or the user doesn't exist.

    This is a simple session-less auth helper for now.
    Replace with JWT (djangorestframework-simplejwt) when going to production.
    """
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return None
    try:
        return User.objects.select_related('business').get(id=user_id)
    except User.DoesNotExist:
        return None

# Authentication

class LoginView(APIView):
    """
    POST /api/auth/login

    Accepts: { "username": "...", "password": "..." }
    Returns: User data (id, username, role, business info) on success.
             401 if credentials are wrong.

    Passwords are compared using Django's secure hash checker,
    so hashed passwords in the database work automatically.
    """

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.select_related('business').get(username=username)
        except User.DoesNotExist:
            # Return the same message as a wrong password to prevent username enumeration
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not check_password(password, user.password_hash):
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Businesses

class BusinessListView(APIView):
    """
    GET /api/businesses/

    Returns a list of all registered businesses.
    Restricted to admin users only.
    """

    def get(self, request):
        user = get_user_from_request(request)

        if not user or not user.is_admin:
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        businesses = Business.objects.all()
        serializer = BusinessSerializer(businesses, many=True)
        return Response(serializer.data)


# Orders

class OrderListView(APIView):
    """
    GET /api/orders/

    - Admins see ALL orders.
    - Business users see only their own business's orders.

    Supports optional query params:
        ?status=Pending     → filter by status
        ?business_id=3      → filter by business (admin only)
    """

    def get(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Start with all orders, prefetch items to avoid N+1 queries
        orders = Order.objects.select_related('business').prefetch_related('items')

        # Business users can only see their own orders
        if not user.is_admin:
            orders = orders.filter(business=user.business)

        # Optional filters from query string
        order_status = request.query_params.get('status')
        business_id  = request.query_params.get('business_id')

        if order_status:
            orders = orders.filter(status=order_status)

        if business_id and user.is_admin:
            orders = orders.filter(business_id=business_id)

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class PlaceOrderView(APIView):
    """
    POST /api/orders/place

    Places a new order for a business. The total_amount is calculated
    automatically from the items — no need to send it in the request.

    Request body:
        {
            "business": 3,
            "items": [
                { "item_name": "Vanilla Tub", "quantity": 2, "price": 4.50 },
                { "item_name": "Choc Scoop",  "quantity": 5, "price": 1.20 }
            ]
        }
    """

    def post(self, request):
        serializer = OrderSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order = serializer.save()

        # Log the action if placed by an admin
        user = get_user_from_request(request)
        if user and user.is_admin:
            AdminLog.record(user, f'Placed order #{order.id} for business #{order.business_id}')

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class UpdateOrderStatusView(APIView):
    """
    PATCH /api/orders/<order_id>/status

    Allows an admin to update the status of an order.
    Also marks email_sent=True when status moves to Confirmed.

    Request body:
        { "status": "Confirmed" }
    """

    def patch(self, request, order_id):
        user = get_user_from_request(request)

        if not user or not user.is_admin:
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in Order.Status.choices]

        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Choose from: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status    = order.status
        order.status  = new_status

        # Automatically flag that a confirmation email should be sent
        if new_status == Order.Status.CONFIRMED:
            order.email_sent = True

        order.save(update_fields=['status', 'email_sent'])

        # Log the status change
        AdminLog.record(user, f'Changed order #{order.id} status: {old_status} → {new_status}')

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

# Admin Logs

class AdminLogView(APIView):
    """
    GET /api/admin/logs/

    Returns the full audit log. Admin-only.
    """

    def get(self, request):
        user = get_user_from_request(request)

        if not user or not user.is_admin:
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        logs       = AdminLog.objects.select_related('admin_user').all()
        serializer = AdminLogSerializer(logs, many=True)
        return Response(serializer.data)
    
    
class RegisterView(APIView):
    """
    POST /api/auth/register

    Creates a new business and a customer user linked to it in one step.

    Request body:
        {
            "username": "...",
            "password": "...",
            "business_name": "...",
            "phone": "...",
            "email": "...",
            "address": "..."
        }
    """

    def post(self, request):
        username      = request.data.get('username', '').strip()
        password      = request.data.get('password', '')
        business_name = request.data.get('business_name', '').strip()
        phone         = request.data.get('phone', '').strip()
        email         = request.data.get('email', '').strip()
        address       = request.data.get('address', '').strip()

        if not username or not password or not business_name:
            return Response(
                {'error': 'Username, password and business name are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already taken.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        business = Business.objects.create(
            name    = business_name,
            phone   = phone,
            email   = email,
            address = address,
        )

        user = User.objects.create(
            username      = username,
            password_hash = make_password(password),
            role          = User.Role.CUSTOMER,
            business      = business,
        )

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)