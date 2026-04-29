from django.contrib.auth import get_user_model


def create_default_demo_users(sender, **kwargs):
    if getattr(sender, 'name', '') != 'api':
        return

    User = get_user_model()
    demo_users = [
        {
            'email': 'brand@demo.com',
            'password': 'demo1234',
            'role': 'brand',
            'first_name': 'Demo',
            'last_name': 'Brand',
        },
        {
            'email': 'admin@demo.com',
            'password': 'admin123',
            'role': 'admin',
            'first_name': 'Demo',
            'last_name': 'Admin',
        },
        {
            'email': 'user@demo.com',
            'password': 'user1234',
            'role': 'consumer',
            'first_name': 'Demo',
            'last_name': 'User',
        },
    ]

    for user_data in demo_users:
        if User.objects.filter(email__iexact=user_data['email']).exists():
            continue

        User.objects.create_user(
            username=user_data['email'],
            email=user_data['email'],
            password=user_data['password'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            role=user_data['role'],
        )
