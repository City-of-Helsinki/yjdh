from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from shared.models.abstract_models import TimeStampedModel, UUIDModel


class AbstractOIDCProfile(UUIDModel, TimeStampedModel):
    id_token = models.CharField(max_length=2048, blank=True, verbose_name=_("id token"))

    access_token = models.CharField(
        max_length=2048, blank=True, verbose_name=_("access token")
    )
    access_token_expires = models.DateTimeField(
        blank=True, null=True, verbose_name=_("access token expires")
    )

    refresh_token = models.CharField(
        max_length=2048, blank=True, verbose_name=_("refresh token")
    )
    refresh_token_expires = models.DateTimeField(
        blank=True, null=True, verbose_name=_("refresh token expires")
    )

    class Meta:
        abstract = True

    @property
    def is_active_access_token(self):
        if not self.access_token_expires or self.access_token_expires < timezone.now():
            return False
        return True

    @property
    def is_active_refresh_token(self):
        if (
            not self.refresh_token_expires
            or self.refresh_token_expires < timezone.now()
        ):
            return False
        return True


class OIDCProfile(AbstractOIDCProfile):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_("user"),
        related_name="oidc_profile",
    )


class EAuthorizationProfile(AbstractOIDCProfile):
    oidc_profile = models.OneToOneField(
        OIDCProfile,
        on_delete=models.CASCADE,
        verbose_name=_("oidc_profile"),
        related_name="eauthorization_profile",
    )
