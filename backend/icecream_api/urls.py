from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──
    path('auth/login',      views.LoginView.as_view(),         name='login'),
    path('auth/register',   views.RegisterView.as_view(),      name='register'),
    path('auth/refresh',    views.RefreshTokenView.as_view(),  name='token_refresh'),
    path('auth/logout',     views.LogoutView.as_view(),        name='logout'),
    path('auth/me',         views.MeView.as_view(),            name='me'),
    path('auth/me/update',  views.UpdateProfileView.as_view(), name='update_profile'),

    # ── Businesses ──
    path('businesses/', views.BusinessListView.as_view(), name='business_list'),

    # ── Orders ──
    path('orders/',                        views.OrderListView.as_view(),         name='order_list'),
    path('orders/my-orders',               views.MyOrdersView.as_view(),          name='my_orders'),
    path('orders/place',                   views.PlaceOrderView.as_view(),        name='place_order'),
    path('orders/<int:order_id>/status',   views.UpdateOrderStatusView.as_view(), name='update_order_status'),
    path('orders/<int:order_id>/cancel',   views.CancelOrderView.as_view(),       name='cancel_order'),

    # ── Admin ──
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin_stats'),
    path('admin/logs/',  views.AdminLogView.as_view(),   name='admin_logs'),
]