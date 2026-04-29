from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from django.db.models.signals import post_migrate
        from .signals import create_default_demo_users

        post_migrate.connect(create_default_demo_users, sender=self.__class__)
