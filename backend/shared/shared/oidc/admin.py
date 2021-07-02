from django.contrib import admin
from shared.oidc.models import EAuthorizationProfile, OIDCProfile


class OIDCProfileAdmin(admin.ModelAdmin):
    fields = ("id_token",)
    readonly_fields = ("id_token",)


class EAuthorizationProfileAdmin(admin.ModelAdmin):
    fields = ("id_token",)
    readonly_fields = ("id_token",)


admin.site.register(OIDCProfile, OIDCProfileAdmin)
admin.site.register(EAuthorizationProfile, EAuthorizationProfileAdmin)
