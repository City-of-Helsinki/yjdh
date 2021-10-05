from django_auth_adfs.config import ProviderConfig

from shared.common.utils import get_public_reverse_url


class HelsinkiProviderConfig(ProviderConfig):
    def redirect_uri(self, request):
        return get_public_reverse_url(request, "django_auth_adfs:callback")


provider_config = HelsinkiProviderConfig()
