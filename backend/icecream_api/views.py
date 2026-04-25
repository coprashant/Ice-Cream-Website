import json
import re

from django.contrib.auth.hashers import check_password, make_password
from django.db.models            import Sum

from rest_framework.views       import APIView
from rest_framework.response    import Response
from rest_framework             import status
from rest_framework.permissions import AllowAny

from rest_framework_simplejwt.tokens     import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from .models      import User, Order, Business, AdminLog
from .serializers import (
    UserSerializer,
    OrderSerializer,
    BusinessSerializer,
    AdminLogSerializer,
)


# NOTE: every view sets permission_classes = [AllowAny] because DRF authentication
# backends are not configured for our custom User model. Authentication is enforced
# manually via require_auth() and require_admin() helpers below. DRF's own auth layer
# is intentionally bypassed.


# ------------------------------------------------------------------
# JWT helpers
# ------------------------------------------------------------------

def get_user_from_token(request):
    """
    Decodes the Bearer token and returns the matching User, or None.
    Validates signature and expiry via simplejwt AccessToken.
    """
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    raw_token = auth_header.split(' ', 1)[1]
    try:
        token   = AccessToken(raw_token)
        user_id = token.get('user_id')
        return User.objects.select_related('business').get(id=user_id)
    except (TokenError, User.DoesNotExist, Exception):
        return None


def jwt_response(user):
    """Builds the login/register response payload: tokens + serialized user."""
    refresh = RefreshToken.for_user(user)
    refresh['role']     = user.role
    refresh['username'] = user.username
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'user':    UserSerializer(user).data,
    }


def require_auth(request):
    """
    Returns (user, None) on success.
    Returns (None, Response) when the token is missing or invalid.
    Use at the top of every protected view.
    """
    user = get_user_from_token(request)
    if not user:
        return None, Response(
            {'error': 'Authentication required.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return user, None


def require_admin(request):
    """
    Returns (user, None) when the authenticated user has the ADMIN role.
    Returns (None, Response) otherwise.
    """
    user, err = require_auth(request)
    if err:
        return None, err
    if not user.is_admin:
        return None, Response(
            {'error': 'Admin access required.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    return user, None


# ------------------------------------------------------------------
# Authentication
# ------------------------------------------------------------------

class LoginView(APIView):
    """POST /api/auth/login"""
    permission_classes = [AllowAny]

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

        return Response(jwt_response(user), status=status.HTTP_200_OK)


class RegisterView(APIView):
    """POST /api/auth/register"""
    permission_classes = [AllowAny]

    # username must be 3-50 alphanumeric/underscore characters
    _USERNAME_RE = re.compile(r'^[a-zA-Z0-9_]{3,50}$')

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
                {'error': 'Username, password, and business name are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not self._USERNAME_RE.match(username):
            return Response(
                {'error': 'Username must be 3-50 characters and contain only letters, numbers, or underscores.'},
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
            contact_person = contact_person or None,
            phone          = phone          or None,
            email          = email          or None,
            address        = address        or None,
        )

        user = User.objects.create(
            username      = username,
            password_hash = make_password(password),
            role          = User.Role.CUSTOMER,
            business      = business,
        )

        return Response(jwt_response(user), status=status.HTTP_201_CREATED)


class RefreshTokenView(APIView):
    """POST /api/auth/refresh"""
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.data.get('refresh', '')
        if not token_str:
            return Response(
                {'error': 'Refresh token required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            refresh = RefreshToken(token_str)
            return Response(
                {'access': str(refresh.access_token)},
                status=status.HTTP_200_OK,
            )
        except TokenError:
            return Response(
                {'error': 'Invalid or expired refresh token. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    """
    POST /api/auth/logout
    Attempts to blacklist the refresh token if simplejwt's blacklist app
    is installed. Silently succeeds even if blacklisting is unavailable,
    because the frontend clears its own token storage on logout regardless.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.data.get('refresh', '')
        if token_str:
            try:
                RefreshToken(token_str).blacklist()
            except Exception:
                # blacklist app not installed or token already invalid
                pass
        return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    """GET /api/auth/me"""
    permission_classes = [AllowAny]

    def get(self, request):
        user, err = require_auth(request)
        if err:
            return err
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    """PATCH /api/auth/me/update"""
    permission_classes = [AllowAny]

    _UPDATABLE = ['contact_person', 'phone', 'email', 'address', 'name']

    def patch(self, request):
        user, err = require_auth(request)
        if err:
            return err

        if not user.business:
            return Response(
                {'error': 'No business linked to this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        business = user.business
        changed  = False
        for field in self._UPDATABLE:
            if field in request.data:
                setattr(business, field, request.data[field])
                changed = True

        if changed:
            business.save()

        # re-fetch so the serializer sees the fresh related data
        user.refresh_from_db()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


# ------------------------------------------------------------------
# Businesses
# ------------------------------------------------------------------

class BusinessListView(APIView):
    """GET /api/businesses/  — admin only"""
    permission_classes = [AllowAny]

    def get(self, request):
        user, err = require_admin(request)
        if err:
            return err
        businesses = Business.objects.all()
        return Response(BusinessSerializer(businesses, many=True).data)


# ------------------------------------------------------------------
# Orders
# ------------------------------------------------------------------

def _order_qs():
    """Base queryset used by every order view to avoid N+1 queries."""
    return (
        Order.objects
        .select_related('business')
        .prefetch_related('items')
    )


def _serialize_orders(queryset, request=None):
    """Serializes a queryset, passing request context for absolute screenshot URLs."""
    return OrderSerializer(queryset, many=True, context={'request': request}).data


def _serialize_order(instance, request=None):
    """Serializes a single order instance."""
    return OrderSerializer(instance, context={'request': request}).data


class OrderListView(APIView):
    """
    GET /api/orders/
    Admin receives all orders. Customers receive only their own.
    Optional query params: ?status=Pending  ?business_id=3 (admin only)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user, err = require_auth(request)
        if err:
            return err

        orders = _order_qs()

        if not user.is_admin:
            orders = orders.filter(business=user.business)

        order_status = request.query_params.get('status')
        business_id  = request.query_params.get('business_id')

        if order_status:
            orders = orders.filter(status=order_status)
        if business_id and user.is_admin:
            orders = orders.filter(business_id=business_id)

        return Response(_serialize_orders(orders, request))


class MyOrdersView(APIView):
    """GET /api/orders/my-orders  — returns the authenticated customer's orders"""
    permission_classes = [AllowAny]

    def get(self, request):
        user, err = require_auth(request)
        if err:
            return err

        orders = (
            _order_qs()
            .filter(business=user.business)
            .order_by('-order_date')
        )
        return Response(_serialize_orders(orders, request))


class PlaceOrderView(APIView):
    """
    POST /api/orders/place  — authenticated

    Accepts two content types:

    1. application/json
       {
         "business": <id>,   (ignored for customers, forced to their own business)
         "items":    [{"item_name": "Vanilla", "quantity": 2, "price": 150}, ...],
         "payment_done": true | false
       }

    2. multipart/form-data  (used when a payment screenshot is attached)
       - business:           <id>
       - items:              JSON string  e.g. '[{"item_name": "..."}]'
       - payment_done:       "true" | "false"
       - payment_screenshot: image file
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user, err = require_auth(request)
        if err:
            return err

        content_type = request.content_type or ''
        is_multipart = 'multipart/form-data' in content_type

        if is_multipart:
            items_raw = request.data.get('items', '[]')
            try:
                items = json.loads(items_raw)
            except (json.JSONDecodeError, TypeError):
                return Response(
                    {'error': 'items must be a valid JSON string in multipart requests.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            payment_done       = request.data.get('payment_done', 'false').lower() == 'true'
            payment_screenshot = request.FILES.get('payment_screenshot')
        else:
            items              = request.data.get('items', [])
            payment_done       = bool(request.data.get('payment_done', False))
            payment_screenshot = None

        if not items:
            return Response(
                {'error': 'An order must have at least one item.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # customers can only order for their own business
        business_id = user.business.id if not user.is_admin else request.data.get('business')
        if not business_id:
            return Response(
                {'error': 'business is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = {
            'business':     business_id,
            'items':        items,
            'payment_done': payment_done,
        }

        serializer = OrderSerializer(data=data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order = serializer.save()

        # attach screenshot after save so we have a pk for the upload path
        if payment_screenshot:
            order.payment_screenshot = payment_screenshot
            order.save(update_fields=['payment_screenshot'])

        # log when an admin places an order on behalf of a business
        if user.is_admin:
            AdminLog.record(
                user,
                f'Placed order #{order.id} for business #{order.business_id}',
            )

        return Response(
            _serialize_order(order, request),
            status=status.HTTP_201_CREATED,
        )


class UpdateOrderStatusView(APIView):
    """PATCH /api/orders/<order_id>/status  — admin only"""
    permission_classes = [AllowAny]

    def patch(self, request, order_id):
        user, err = require_admin(request)
        if err:
            return err

        try:
            order = _order_qs().get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

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

        AdminLog.record(
            user,
            f'Changed order #{order.id} status from {old_status} to {new_status}',
        )

        return Response(_serialize_order(order, request), status=status.HTTP_200_OK)


class CancelOrderView(APIView):
    """PATCH /api/orders/<order_id>/cancel  — authenticated"""
    permission_classes = [AllowAny]

    def patch(self, request, order_id):
        user, err = require_auth(request)
        if err:
            return err

        try:
            order = _order_qs().get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.is_admin and order.business != user.business:
            return Response(
                {'error': 'You can only cancel your own orders.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if order.status == Order.Status.CANCELLED:
            return Response(
                {'error': 'Order is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_admin and order.status != Order.Status.PENDING:
            return Response(
                {'error': 'Only pending orders can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = Order.Status.CANCELLED
        order.save(update_fields=['status'])

        if user.is_admin:
            AdminLog.record(user, f'Admin cancelled order #{order.id}')

        return Response(_serialize_order(order, request), status=status.HTTP_200_OK)


# ------------------------------------------------------------------
# Admin
# ------------------------------------------------------------------

class AdminStatsView(APIView):
    """GET /api/admin/stats/  — admin only"""
    permission_classes = [AllowAny]

    def get(self, request):
        from django.utils import timezone

        user, err = require_admin(request)
        if err:
            return err

        now         = timezone.now()
        today       = now.date()
        month_start = today.replace(day=1)

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
            'total_orders':     Order.objects.count(),
            'pending_count':    Order.objects.filter(status=Order.Status.PENDING).count(),
            'confirmed_count':  Order.objects.filter(status=Order.Status.CONFIRMED).count(),
            'total_businesses': Business.objects.count(),
            'revenue_today':    float(revenue_today),
            'revenue_month':    float(revenue_month),
        })


# ------------------------------------------------------------------
# Admin Logs
# ------------------------------------------------------------------

class AdminLogView(APIView):
    """GET /api/admin/logs/  — admin only"""
    permission_classes = [AllowAny]

    def get(self, request):
        user, err = require_admin(request)
        if err:
            return err

        logs = AdminLog.objects.select_related('admin_user').all()
        return Response(AdminLogSerializer(logs, many=True).data)