from django.contrib import admin
from django.contrib.admin import display
from django.utils.translation import gettext_lazy as _

from messages.models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("created_at", "message_type", "get_application_number")
    ordering = ("-created_at",)

    @display(
        ordering="application__application_number", description=_("Application number")
    )
    def get_application_number(self, obj):
        return obj.application.application_number
