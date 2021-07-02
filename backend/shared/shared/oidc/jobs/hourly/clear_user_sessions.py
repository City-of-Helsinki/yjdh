from django.utils import timezone
from django_extensions.management.jobs import HourlyJob
from shared.oidc.models import EAuthorizationProfile, OIDCProfile
from shared.oidc.services import clear_eauthorization_profiles, clear_oidc_profiles


class Job(HourlyJob):
    help = "Clear e-authorization sessions over 2h old. Clear oidc profiles that have expired refresh tokens."

    def execute(self):
        eauthorization_profiles = EAuthorizationProfile.objects.filter(
            refresh_token_expires__lt=timezone.now(),
            # modified_at__gt=timezone.now() - datetime.timedelta(hours=2)
        )
        clear_eauthorization_profiles(eauthorization_profiles)

        oidc_profiles = OIDCProfile.objects.filter(
            refresh_token_expires__lt=timezone.now(),
        )
        clear_oidc_profiles(oidc_profiles)
