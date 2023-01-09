import pytest
from dateutil.relativedelta import relativedelta
from django.utils import timezone

from applications.enums import YouthApplicationStatus
from applications.jobs.daily import (
    clean_inactive_youth_applications,
    clean_old_youth_applications,
    clean_rejected_youth_applications,
)
from applications.models import YouthApplication, YouthSummerVoucher
from common.tests.factories import (
    AcceptedYouthApplicationFactory,
    ActiveYouthApplicationFactory,
    InactiveYouthApplicationFactory,
    RejectedYouthApplicationFactory,
    UnhandledYouthApplicationFactory,
    YouthApplicationFactory,
)


def set_creation_date(applications, created_at):
    for application in applications:
        application.created_at = created_at
        application.save()
    return applications


@pytest.mark.django_db
def test_clean_inactive_youth_applications_older_than_week():
    date_week_ago = timezone.now() - relativedelta(weeks=1)
    date_less_than_week_ago = timezone.now() - relativedelta(days=6)

    # Create different applications
    inactive_applications_created_week_ago = set_creation_date(
        InactiveYouthApplicationFactory.create_batch(size=5),
        created_at=date_week_ago,
    )

    inactive_applications_created_less_than_week_ago = set_creation_date(
        InactiveYouthApplicationFactory.create_batch(size=5),
        created_at=date_less_than_week_ago,
    )
    active_applications_created_week_ago = set_creation_date(
        ActiveYouthApplicationFactory.create_batch(size=5),
        created_at=date_week_ago,
    )

    # Run the batch job
    clean_inactive_youth_applications.Job().execute()

    assert not YouthApplication.objects.filter(
        pk__in=[app.id for app in inactive_applications_created_week_ago]
    ).exists(), "Inactive applications should have been cleaned"

    for application in inactive_applications_created_less_than_week_ago:
        assert YouthApplication.objects.filter(
            pk=application.id
        ).exists(), "Newer inactive applications should still exist"

    for application in active_applications_created_week_ago:
        assert YouthApplication.objects.filter(
            pk=application.id
        ).exists(), "Active applications should still exist"


@pytest.mark.django_db
def test_clean_rejected_youth_applications_older_than_year():
    date_year_ago = timezone.now() - relativedelta(year=1)
    date_less_than_year_ago = timezone.now() - relativedelta(years=1, days=-1)

    # Create different applications
    rejected_applications_created_year_ago = set_creation_date(
        RejectedYouthApplicationFactory.create_batch(size=5), created_at=date_year_ago
    )

    rejected_applications_created_less_than_year_ago = set_creation_date(
        RejectedYouthApplicationFactory.create_batch(size=5),
        created_at=date_less_than_year_ago,
    )

    unhandled_applications_created_year_ago = set_creation_date(
        UnhandledYouthApplicationFactory.create_batch(size=5), created_at=date_year_ago
    )

    accepted_applications_created_year_ago = set_creation_date(
        AcceptedYouthApplicationFactory.create_batch(size=5), created_at=date_year_ago
    )

    # Run the batch job
    clean_rejected_youth_applications.Job().execute()

    assert not YouthApplication.objects.filter(
        pk__in=[app.id for app in rejected_applications_created_year_ago]
    ).exists(), "Rejected application older than year should have been cleaned"

    for application in rejected_applications_created_less_than_year_ago:
        assert YouthApplication.objects.filter(
            pk=application.id
        ).exists(), "Newer rejected applications should still exist"

    for application in unhandled_applications_created_year_ago:
        assert YouthApplication.objects.filter(
            pk=application.id
        ).exists(), "Unhandled applications should still exist"

    for application in accepted_applications_created_year_ago:
        assert YouthApplication.objects.filter(
            pk=application.id
        ).exists(), "Accepted applications should still exist"


@pytest.mark.django_db
def test_clean_all_youth_applications_older_than_five_years():
    date_five_years_ago = timezone.now() - relativedelta(years=5)
    date_under_five_years_ago = timezone.now() - relativedelta(years=5, days=-1)

    # Create applications with all possible statuses
    applications_created_five_years_ago = set_creation_date(
        [
            YouthApplicationFactory(status=status)
            for status in YouthApplicationStatus.values
        ],
        created_at=date_five_years_ago,
    )

    applications_created_less_than_five_years_ago = set_creation_date(
        [
            YouthApplicationFactory(status=status)
            for status in YouthApplicationStatus.values
        ],
        created_at=date_under_five_years_ago,
    )

    # related summer vouchers
    summer_vouchers_created_five_years_ago = YouthSummerVoucher.objects.filter(
        youth_application__in=[app.pk for app in applications_created_five_years_ago]
    )
    assert len(summer_vouchers_created_five_years_ago) > 0

    summer_vouchers_created_less_than_five_years_ago = (
        YouthSummerVoucher.objects.filter(
            youth_application__in=applications_created_less_than_five_years_ago
        )
    )
    assert len(summer_vouchers_created_less_than_five_years_ago) > 0

    # Run the batch job
    clean_old_youth_applications.Job().execute()

    assert not YouthApplication.objects.filter(
        pk__in=[app.id for app in applications_created_five_years_ago]
    ).exists(), "Old applications should have been cleaned"

    assert not YouthSummerVoucher.objects.filter(
        pk__in=[
            summer_voucher.id
            for summer_voucher in summer_vouchers_created_five_years_ago
        ]
    ).exists(), "Old summer vouchers should have been cleaned"

    for application in applications_created_less_than_five_years_ago:
        assert YouthApplication.objects.filter(
            pk=application.id
        ).exists(), "Newer applications should still exist"

    for summer_voucher in summer_vouchers_created_less_than_five_years_ago:
        assert YouthSummerVoucher.objects.filter(
            pk=summer_voucher.id
        ).exists(), "Newer summer vouchers should still exist"
