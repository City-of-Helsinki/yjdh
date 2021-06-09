from django.contrib import admin
from django.contrib.auth import get_user_model


class UserAdmin(admin.ModelAdmin):
    list_filter = ("groups",)
    list_display = (
        "id",
        "__str__",
    )
    readonly_fields = ("password",)
    search_fields = (
        "id",
        "email",
        "first_name",
        "last_name",
    )


admin.site.register(get_user_model(), UserAdmin)
