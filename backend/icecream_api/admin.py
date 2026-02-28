from django.contrib import admin
from .models import Business, User, Order, OrderItem, AdminLog


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email')
    ordering      = ('name',)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display  = ('id', 'username', 'role', 'business', 'created_at')
    list_filter   = ('role',)
    search_fields = ('username',)
    ordering      = ('username',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ('id', 'business', 'status', 'total_amount', 'order_date', 'email_sent')
    list_filter   = ('status', 'email_sent')
    search_fields = ('business__name',)
    ordering      = ('-order_date',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'item_name', 'quantity', 'price')
    ordering     = ('order',)


@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display  = ('id', 'admin_user', 'action', 'action_time')
    search_fields = ('action', 'admin_user__username')
    ordering      = ('-action_time',)
    readonly_fields = ('admin_user', 'action', 'action_time')   # logs are immutable