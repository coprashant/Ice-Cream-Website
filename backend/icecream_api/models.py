
from django.db import models
from django.utils import timezone


class Business(models.Model):
    """
    Represents a B2B client business that places ice cream orders.
    Every order and non-admin user belongs to a Business.
    """

    name    = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    phone   = models.CharField(max_length=20, blank=True, null=True)
    email   = models.EmailField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'businesses'
        ordering = ['name']     # default alphabetical order in queries

    def __str__(self):
        return self.name


class User(models.Model):
    """
    Represents a system user — either an Admin or a Business customer.

    - Admins:    business is None, full system access.
    - Customers: linked to a Business, can only place/view their own orders.

    Passwords are stored as hashes — NEVER plain text.
    Use make_password() to save and check_password() to verify (see views.py).
    """

    class Role(models.TextChoices):
        ADMIN    = 'ADMIN',    'Admin'
        CUSTOMER = 'CUSTOMER', 'Customer'

    username      = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    role          = models.CharField(max_length=20, choices=Role.choices)

    business = models.ForeignKey(
        Business,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        db_column='business_id',    
    )

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.username} ({self.role})'

    @property
    def is_admin(self):
        """Quick role check: use user.is_admin instead of comparing strings."""
        return self.role == self.Role.ADMIN


class Order(models.Model):
    """
    Represents a single ice cream order placed by a business.
    Each Order can contain multiple OrderItems.

    Status flow:  Pending → Confirmed → Completed
                                      → Cancelled
    """

    class Status(models.TextChoices):
        PENDING   = 'Pending',   'Pending'
        CONFIRMED = 'Confirmed', 'Confirmed'
        COMPLETED = 'Completed', 'Completed'
        CANCELLED = 'Cancelled', 'Cancelled'

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='orders',
        db_column='business_id',
    )

    order_date   = models.DateTimeField(default=timezone.now)
    status       = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    email_sent   = models.BooleanField(default=False)

    class Meta:
        db_table = 'orders'
        ordering = ['-order_date']  # newest orders appear first

    def __str__(self):
        return f'Order #{self.id} — {self.business} ({self.status})'

    def recalculate_total(self):
        """
        Recalculates total_amount from the attached OrderItems and saves.
        Call this after adding or changing items to keep the total accurate.

        Usage:
            order.recalculate_total()
        """
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save(update_fields=['total_amount'])
        return total


class OrderItem(models.Model):
    """
    A single line item within an Order.
    Example: "Vanilla Tub  x2  @ $4.50"

    Deleting an Order automatically deletes all its items (CASCADE).
    """

    order     = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=100)
    quantity  = models.PositiveIntegerField()
    price     = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f'{self.item_name} x{self.quantity}'

    @property
    def subtotal(self):
        """Line total: price × quantity."""
        return self.price * self.quantity


class AdminLog(models.Model):
    """
    Audit trail of actions performed by admin users.
    Use AdminLog.record() to log actions from anywhere in the codebase.
    """

    admin_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='logs',
        db_column='admin_user_id',
    )
    action      = models.CharField(max_length=255)
    action_time = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'admin_logs'
        ordering = ['-action_time']     # most recent logs first

    def __str__(self):
        return f'[{self.action_time:%Y-%m-%d %H:%M}] {self.admin_user.username}: {self.action}'

    @classmethod
    def record(cls, admin_user, action):
        """
        Shortcut to create a log entry anywhere in one line.

        Usage:
            AdminLog.record(user, "Confirmed order #42")
            AdminLog.record(user, f"Cancelled order #{order.id}")
        """
        return cls.objects.create(admin_user=admin_user, action=action)