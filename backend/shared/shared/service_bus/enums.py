from django.db import models
from django.utils.translation import gettext_lazy as _


class YtjOrganizationCode(models.IntegerChoices):
    """
    Source: YTJ-rajapinnan koodiston kuvaus, available at https://liityntakatalogi.suomi.fi/dataset/xroadytj-services
    file: suomi_fi_palveluvayla_ytj_rajapinta_koodistot_v1_4.xlsx

    Only the default organization form codes are listed here.
    The document from YTJ only has the names for the codes in Finnish. Also, the code names are only
    used in the handler UI so no translation required currently.
    """

    ASSOCIATION_FORM_CODE_DEFAULT = 29, _("Muu yhdistys")
    COMPANY_FORM_CODE_DEFAULT = 16, _("Osakeyhtiö")
