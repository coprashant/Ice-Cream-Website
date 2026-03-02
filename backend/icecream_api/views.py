from django.contrib.auth.hashers import check_password, make_password
from rest_framework.views     import APIView
from rest_framework.response  import Response
from rest_framework           import status

from .models      import User, Order, Business, AdminLog
from .serializers import (
    UserSerializer,
    OrderSerializer,
    BusinessSerializer,
    AdminLogSerializer,
)


def get_user_from_request(request):
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return None
    try:
        return User.objects.select_related('business').get(id=user_id)
    except User.DoesNotExist:
        return None


# ------------------------------------------------------------------
# Authentication
# ------------------------------------------------------------------

class LoginView(APIView):
    """POST /api/auth/login"""

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
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not check_password(password, user.password_hash):
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """
    POST /api/auth/register
    Creates a Business and a linked Customer user in one step.
    Only CUSTOMER accounts can be registered this way.
    Admin accounts must be created manually via the Django shell.
    """

    def post(self, request):
        username       = request.data.get('username', '').strip()
        password       = request.data.get('password', '')
        business_name  = request.data.get('business_name', '').strip()
        contact_person = request.data.get('contact_person', '').strip()
        phone          = request.data.get('phone', '').strip()
        email          = request.data.get('email', '').strip()
        address        = request.data.get('address', '').strip()

        if not username or not password or not business_name:
            return Response(
                {'error': 'Username, password and business name are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already taken.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        business = Business.objects.create(
            name           = business_name,
            contact_person = contact_person,
            phone          = phone,
            email          = email,
            address        = address,
        )

        user = User.objects.create(
            username      = username,
            password_hash = make_password(password),
            role          = User.Role.CUSTOMER,
            business      = business,
        )

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    """GET /api/auth/me"""

    def get(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    """PATCH /api/auth/me/update"""

    def patch(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.business:
            return Response(
                {'error': 'No business linked to this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        business = user.business
        updatable_fields = ['contact_person', 'phone', 'email', 'address', 'name']

        for field in updatable_fields:
            if field in request.data:
                setattr(business, field, request.data[field])

        business.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


# ------------------------------------------------------------------
# Businesses
# ------------------------------------------------------------------

class BusinessListView(APIView):
    """GET /api/businesses/ — Admin only"""

    def get(self, request):
        user = get_user_from_request(request)

        if not user or not user.is_admin:
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        businesses = Business.objects.all()
        return Response(BusinessSerializer(businesses, many=True).data)


# ------------------------------------------------------------------
# Orders
# ------------------------------------------------------------------

class OrderListView(APIView):
    """
    GET /api/orders/
    Admins see all orders. Customers see only their own.
    Supports ?status= and ?business_id= filters.
    """

    def get(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        orders = Order.objects.select_related('business').prefetch_related('items')

        if not user.is_admin:
            orders = orders.filter(business=user.business)

        order_status = request.query_params.get('status')
        business_id  = request.query_params.get('business_id')

        if order_status:
            orders = orders.filter(status=order_status)
        if business_id and user.is_admin:
            orders = orders.filter(business_id=business_id)

        return Response(OrderSerializer(orders, many=True).data)


class MyOrdersView(APIView):
    """GET /api/orders/my-orders"""

    def get(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        orders = (
            Order.objects
            .filter(business=user.business)
            .select_related('business')
            .prefetch_related('items')
            .order_by('-order_date')
        )

        return Response(OrderSerializer(orders, many=True).data)


class PlaceOrderView(APIView):
    """POST /api/orders/place"""

    def post(self, request):
        serializer = OrderSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order = serializer.save()

        user = get_user_from_request(request)
        if user and user.is_admin:
            AdminLog.record(user, f'Placed order #{order.id} for business #{order.business_id}')

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class UpdateOrderStatusView(APIView):
    """PATCH /api/orders/<order_id>/status — Admin only"""

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

        new_status     = request.data.get('status')
        valid_statuses = [choice[0] for choice in Order.Status.choices]

        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Choose from: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status   = order.status
        order.status = new_status

        if new_status == Order.Status.CONFIRMED:
            order.email_sent = True

        order.save(update_fields=['status', 'email_sent'])
        AdminLog.record(user, f'Changed order #{order.id} status: {old_status} → {new_status}')

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class CancelOrderView(APIView):
    """
    PATCH /api/orders/<order_id>/cancel
    Allows a customer to cancel their own Pending order.
    Admins can cancel any order.
    """

    def patch(self, request, order_id):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            order = Order.objects.select_related('business').get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Customers can only cancel their own orders
        if not user.is_admin and order.business != user.business:
            return Response(
                {'error': 'You can only cancel your own orders.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Only Pending orders can be cancelled by customers
        if not user.is_admin and order.status != Order.Status.PENDING:
            return Response(
                {'error': 'Only pending orders can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status == Order.Status.CANCELLED:
            return Response(
                {'error': 'Order is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = Order.Status.CANCELLED
        order.save(update_fields=['status'])

        if user.is_admin:
            AdminLog.record(user, f'Admin cancelled order #{order.id}')

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


# ------------------------------------------------------------------
# Admin
# ------------------------------------------------------------------

class AdminStatsView(APIView):
    """GET /api/admin/stats/ — Admin only"""

    def get(self, request):
        from django.db.models import Sum, Count
        from django.utils     import timezone
        import datetime

        user = get_user_from_request(request)

        if not user or not user.is_admin:
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        now        = timezone.now()
        today      = now.date()
        month_start = today.replace(day=1)

        total_orders    = Order.objects.count()
        pending_count   = Order.objects.filter(status=Order.Status.PENDING).count()
        confirmed_count = Order.objects.filter(status=Order.Status.CONFIRMED).count()
        total_businesses = Business.objects.count()

        revenue_today = (
            Order.objects
            .filter(order_date__date=today)
            .exclude(status=Order.Status.CANCELLED)
            .aggregate(total=Sum('total_amount'))['total'] or 0
        )

        revenue_month = (
            Order.objects
            .filter(order_date__date__gte=month_start)
            .exclude(status=Order.Status.CANCELLED)
            .aggregate(total=Sum('total_amount'))['total'] or 0
        )

        return Response({
            'total_orders':      total_orders,
            'pending_count':     pending_count,
            'confirmed_count':   confirmed_count,
            'total_businesses':  total_businesses,
            'revenue_today':     float(revenue_today),
            'revenue_month':     float(revenue_month),
        })


# ------------------------------------------------------------------
# Admin Logs
# ------------------------------------------------------------------

class AdminLogView(APIView):
    """GET /api/admin/logs/ — Admin only"""

    def get(self, request):
        user = get_user_from_request(request)

        if not user or not user.is_admin:
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        logs = AdminLog.objects.select_related('admin_user').all()
        return Response(AdminLogSerializer(logs, many=True).data)