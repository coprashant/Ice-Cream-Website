from django.urls import path
from .views import (
    LoginView,
    RegisterView,
    MeView,
    UpdateProfileView,
    BusinessListView,
    OrderListView,
    MyOrdersView,
    PlaceOrderView,
    UpdateOrderStatusView,
    AdminLogView,
)

urlpatterns = [
    # Auth
    path('auth/login',              LoginView.as_view(),             name='login'),
    path('auth/register',           RegisterView.as_view(),          name='register'),
    path('auth/me',                 MeView.as_view(),                name='me'),
    path('auth/me/update',          UpdateProfileView.as_view(),     name='update-profile'),

    # Businesses
    path('businesses/',             BusinessListView.as_view(),      name='business-list'),

    # Orders
    path('orders/',                 OrderListView.as_view(),         name='order-list'),
    path('orders/my-orders',        MyOrdersView.as_view(),          name='my-orders'),
    path('orders/place',            PlaceOrderView.as_view(),        name='place-order'),
    path('orders/<int:order_id>/status', UpdateOrderStatusView.as_view(), name='update-order-status'),

    # Admin
    path('admin/logs/',             AdminLogView.as_view(),          name='admin-logs'),
]