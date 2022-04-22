from django.conf import settings
from django.contrib.auth.models import Group, Permission
from django.core.management import BaseCommand
from django.db.transaction import atomic


class Command(BaseCommand):
    # define which models are available for handlers when accessing the django admin UI
    # format: app_label, model_name (in lower case)
    HANDLER_PERMISSIONS = [
        ("terms", "terms"),
        ("terms", "applicantconsent"),
    ]

    @atomic
    def handle(self, *args, **options):
        try:
            handler_group = Group.objects.get(name=settings.HANDLERS_GROUP_NAME)
        except Group.DoesNotExist:
            raise Exception(
                f"Create group {settings.HANDLERS_GROUP_NAME} by loading groups.json fixture first"
            )
        group_permissions = []
        for app_label, model in self.HANDLER_PERMISSIONS:
            for permission in Permission.objects.filter(
                content_type__app_label=app_label, content_type__model=model
            ):
                group_permissions.append(
                    Group.permissions.through(
                        group=handler_group, permission=permission
                    )
                )

        # Clean previous permissions
        Group.permissions.through.objects.all().delete()

        # Add new permissions
        Group.permissions.through.objects.bulk_create(group_permissions)

        self.stdout.write(
            self.style.SUCCESS(f"Permissions added ({len(group_permissions)})")
        )
        for group in Group.objects.all():
            self.stdout.write(f"{group.name}:")
            for perm in Group.permissions.through.objects.filter(
                group_id=group.id
            ).order_by("permission__codename"):
                self.stdout.write(f"- {perm.permission.codename}")
            self.stdout.write("\n")
