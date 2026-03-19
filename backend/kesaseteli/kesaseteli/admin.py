from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.models import Group, User
from django.utils.translation import gettext_lazy as _


class EmailFilter(admin.SimpleListFilter):
    title = _("email")
    parameter_name = "has_email"

    def lookups(self, request, model_admin):
        return (
            ("yes", _("Has email")),
            ("no", _("No email")),
        )

    def queryset(self, request, queryset):
        if self.value() == "yes":
            return queryset.exclude(email="")
        if self.value() == "no":
            return queryset.filter(email="")
        return queryset


class KesaseteliUserAdmin(UserAdmin):
    list_display = list(UserAdmin.list_display) + ["date_joined"]
    list_filter = ["date_joined", EmailFilter] + list(UserAdmin.list_filter)
    date_hierarchy = "date_joined"


class UserInline(admin.StackedInline):
    model = get_user_model().groups.through
    extra = 0
    autocomplete_fields = ("user",)


class KesaseteliGroupAdmin(GroupAdmin):
    list_display = ("name", "get_user_count")
    inlines = (UserInline,)

    def get_user_count(self, obj):
        return obj.user_set.count()

    get_user_count.short_description = _("User count")


if admin.site.is_registered(User):
    admin.site.unregister(User)
admin.site.register(User, KesaseteliUserAdmin)

if admin.site.is_registered(Group):
    admin.site.unregister(Group)
admin.site.register(Group, KesaseteliGroupAdmin)
