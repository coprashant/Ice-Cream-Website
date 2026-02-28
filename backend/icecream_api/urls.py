
from django.urls import path
from .views import (
    LoginView,
    RegisterView,
    BusinessListView,
    OrderListView,
    PlaceOrderView,
    UpdateOrderStatusView,
    AdminLogView,
)

urlpatterns = [
    # Authentication
    path('auth/login', LoginView.as_view(),  name='login'),
    path('auth/register', RegisterView.as_view(), name='register'),

    # Businesses
    path('businesses/',                  BusinessListView.as_view(),      name='business-list'),

    # Orders
    path('orders/',                      OrderListView.as_view(),         name='order-list'),
    path('orders/place',                 PlaceOrderView.as_view(),        name='place-order'),
    path('orders/<int:order_id>/status', UpdateOrderStatusView.as_view(), name='update-order-status'),

    # Admin audit log
    path('admin/logs/',                  AdminLogView.as_view(),          name='admin-logs'),
]