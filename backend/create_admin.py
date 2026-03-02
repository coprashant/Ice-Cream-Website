from django.contrib.auth.hashers import make_password
from icecream_api.models import User, Business

# Create a dummy business for the admin (required by the model)
business, _ = Business.objects.get_or_create(
    name='Sheetal Admin',
    defaults={
        'contact_person': 'Admin',
        'phone': '',
        'email': '',
        'address': '',
    }
)

# Create the admin user
user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'password_hash': make_password('admin1234'),
        'role': User.Role.ADMIN,
        'business': business,
    }
)

if created:
    print(f"✅ Admin created — username: admin  password: admin1234  id: {user.id}")
else:
    print(f"ℹ️  Admin already exists — id: {user.id}  role: {user.role}")