from io import StringIO

from django.core.management import call_command

from applications.enums import ApplicationStatus
from applications.models import Application


def test_seed_applications_with_arguments():
    amount = 10
    statuses = ApplicationStatus.values
    total_created = len(ApplicationStatus.values) * amount
    out = StringIO()
    call_command("seed", number=amount, stdout=out)

    seeded_applications = Application.objects.filter(
        status__in=statuses,
    )
    assert seeded_applications.count() == total_created
    assert f"Created {total_created} applications" in out.getvalue()
