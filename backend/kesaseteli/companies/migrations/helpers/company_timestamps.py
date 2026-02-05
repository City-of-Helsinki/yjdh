import logging

from django.db.models import Min

LOGGER = logging.getLogger(__name__)


def populate_company_timestamps(company_model):
    """
    Populate Company.created_at and Company.modified_at fields based on the
    earliest EmployerApplication.created_at that references each Company.

    Companies without any EmployerApplication references are left unchanged,
    because there is no data to determine appropriate timestamps for them.
    """
    total_count = company_model.objects.count()

    companies_with_min_created_at = (
        company_model.objects.filter(employer_applications__isnull=False)
        .annotate(min_application_created_at=Min("employer_applications__created_at"))
        .only("id")
    )

    companies_to_update = []

    for company in companies_with_min_created_at:
        company.created_at = company.min_application_created_at
        company.modified_at = company.min_application_created_at
        companies_to_update.append(company)

    updated_count = company_model.objects.bulk_update(
        companies_to_update,
        fields=["created_at", "modified_at"],
        batch_size=500,  # To limit a single batch's SQL UPDATE clause size
    )

    LOGGER.info(f"Handled {total_count} companies:")
    LOGGER.info(
        f"- Set timestamps using related employer applications: {updated_count}"
    )
    LOGGER.info(f"- Did nothing for unused companies: {total_count - updated_count}")
