import logging
from typing import TYPE_CHECKING

import applications.target_groups
from applications.models import SummerVoucherConfiguration

if TYPE_CHECKING:
    from applications.models import YouthApplication

LOGGER = logging.getLogger(__name__)


class TargetGroupValidationService:
    def get_associated_target_group(
        self, application: "YouthApplication"
    ) -> str | None:
        """
        Return the identifier of the first matching target group if the applicant
        belongs to any of the enabled target groups for the application's year.
        Returns None if no match found.
        """

        try:
            configs = SummerVoucherConfiguration.objects.filter(
                year=application.created_at.year
            )
        except SummerVoucherConfiguration.DoesNotExist:
            # TODO: Should a missing config be an error? Where should it be raised?
            LOGGER.warning(
                "No SummerVoucherConfiguration found for year %s",
                application.created_at.year,
            )
            return None

        for config in configs:
            for identifier in config.target_group:
                target_group_class = applications.target_groups.get_target_group_class(
                    identifier
                )
                if target_group_class and target_group_class().is_valid(application):
                    return identifier

        return None

    def is_applicant_in_target_group(self, application: "YouthApplication") -> bool:
        """
        Check if the applicant belongs to any of the enabled target groups for the
        application's year.
        """
        return self.get_associated_target_group(application) is not None
