from django.db import models
from django.utils import timezone


class Business(models.Model):
    name           = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    address        = models.TextField(blank=True, null=True)
    phone          = models.CharField(max_length=20, blank=True, null=True)
    email          = models.EmailField(max_length=100, blank=True, null=True)
    created_at     = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'businesses'
        ordering = ['name']

    def __str__(self):
        return self.name


class User(models.Model):
    class Role(models.TextChoices):
        ADMIN    = 'ADMIN',    'Admin'
        CUSTOMER = 'CUSTOMER', 'Customer'

    username      = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    role          = models.CharField(max_length=20, choices=Role.choices)
    business      = models.ForeignKey(
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
        return self.role == self.Role.ADMIN


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING   = 'Pending',   'Pending'
        CONFIRMED = 'Confirmed', 'Confirmed'
        COMPLETED = 'Completed', 'Completed'
        CANCELLED = 'Cancelled', 'Cancelled'

    business     = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='orders',
        db_column='business_id',
    )
    order_date   = models.DateTimeField(default=timezone.now)
    status       = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    email_sent   = models.BooleanField(default=False)

    class Meta:
        db_table = 'orders'
        ordering = ['-order_date']

    def __str__(self):
        return f'Order #{self.id} — {self.business} ({self.status})'

    def recalculate_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save(update_fields=['total_amount'])
        return total


class OrderItem(models.Model):
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
        return self.price * self.quantity


class AdminLog(models.Model):
    admin_user  = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='logs',
        db_column='admin_user_id',
    )
    action      = models.CharField(max_length=255)
    action_time = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'admin_logs'
        ordering = ['-action_time']

    def __str__(self):
        return f'[{self.action_time:%Y-%m-%d %H:%M}] {self.admin_user.username}: {self.action}'

    @classmethod
    def record(cls, admin_user, action):
        return cls.objects.create(admin_user=admin_user, action=action)