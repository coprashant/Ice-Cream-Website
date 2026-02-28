from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import Business, User, Order, OrderItem, AdminLog


class BusinessSerializer(serializers.ModelSerializer):
    """Serializer for Business — used when creating or returning business info."""

    class Meta:
        model  = Business
        fields = ['id', 'name', 'address', 'phone', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for returning user data in responses.
    Password is intentionally excluded — never send it to the client.
    """

    business_name = serializers.CharField(source='business.name', read_only=True)

    class Meta:
        model  = User
        fields = ['id', 'username', 'role', 'business', 'business_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterUserSerializer(serializers.ModelSerializer):
    """
    Used only when creating a new user (e.g. admin creates a business account).
    Accepts a plain-text password, hashes it before saving.
    """

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = User
        fields = ['username', 'password', 'role', 'business']

    def create(self, validated_data):
        validated_data['password_hash'] = make_password(validated_data.pop('password'))
        return super().create(validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for a single order line item.
    'subtotal' is a calculated field (price × quantity) — read-only.
    """

    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,    
    )

    class Meta:
        model  = OrderItem
        fields = ['id', 'item_name', 'quantity', 'price', 'subtotal']
        read_only_fields = ['id', 'subtotal']

    def validate_quantity(self, value):
        """Quantity must be at least 1."""
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value

    def validate_price(self, value):
        """Price must be positive."""
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than zero.')
        return value


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Orders. Handles nested OrderItems in a single request.

    Incoming JSON shape:
        {
            "business": 3,
            "items": [
                {"item_name": "Vanilla Tub", "quantity": 2, "price": 4.50},
                {"item_name": "Choc Scoop",  "quantity": 5, "price": 1.20}
            ]
        }

    The serializer automatically calculates total_amount from the items.
    """
    
    items = OrderItemSerializer(many=True)

    business_name = serializers.CharField(source='business.name', read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'business', 'business_name',
            'order_date', 'status', 'total_amount', 'email_sent', 'items',
        ]
        read_only_fields = ['id', 'order_date', 'total_amount', 'email_sent', 'business_name']

    def validate_items(self, value):
        """An order must contain at least one item."""
        if not value:
            raise serializers.ValidationError('An order must have at least one item.')
        return value

    def create(self, validated_data):
        """
        Creates the Order and all its OrderItems in one go.
        Also calculates and stores the total_amount automatically.
        """
        items_data = validated_data.pop('items')

        order = Order.objects.create(**validated_data)

        total = 0
        for item_data in items_data:
            item = OrderItem.objects.create(order=order, **item_data)
            total += item.subtotal

        order.total_amount = total
        order.save(update_fields=['total_amount'])

        return order

    def update(self, instance, validated_data):
        """
        Updates an existing order and replaces its items entirely.
        Used when an admin edits an order.
        """
        items_data = validated_data.pop('items', None)

        # Update the order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If new items were provided, replace the old ones
        if items_data is not None:
            instance.items.all().delete()
            total = 0
            for item_data in items_data:
                item = OrderItem.objects.create(order=instance, **item_data)
                total += item.subtotal
            instance.total_amount = total
            instance.save(update_fields=['total_amount'])

        return instance


class AdminLogSerializer(serializers.ModelSerializer):
    """Read-only serializer for audit log entries."""

    admin_username = serializers.CharField(source='admin_user.username', read_only=True)

    class Meta:
        model  = AdminLog
        fields = ['id', 'admin_username', 'action', 'action_time']
        read_only_fields = fields