"""
Tests to document how audit_logging._add_changes (django-simple-history diff) behaves.

Here instead of in shared backend's tests to test more concretely
without mocking, and to not make django-simple-history a dependency
in shared backend.
"""

from datetime import date
from decimal import Decimal

import pytest
from django.core.files.base import ContentFile
from resilient_logger.models import ResilientLogEntry

from applications.enums import BenefitType
from applications.models import Application
from applications.tests.factories import (
    ApplicationBasisFactory,
    ApplicationFactory,
    AttachmentFactory,
    EmployeeFactory,
)
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation
from shared.common.tests.factories import UserFactory


def _latest_resilient_log_entry_changes():
    """Get the changes from the latest resilient log entry."""
    return ResilientLogEntry.objects.latest("created_at").context.get("changes")


def _audit_log_update_to_object(target):
    """Audit log an UPDATE for target."""
    audit_logging.log(
        actor=None, actor_backend="", operation=Operation.UPDATE, target=target
    )


@pytest.mark.django_db
def test_char_field_change_is_logged():
    """Test that CharField change is audit logged with old & new value"""
    app = ApplicationFactory(company_name="Old Co")
    app.company_name = "New Co"
    app.save()
    _audit_log_update_to_object(app)
    assert _latest_resilient_log_entry_changes() == [
        "company_name changed from Old Co to New Co"
    ]


@pytest.mark.django_db
def test_char_field_with_choices_is_logged():
    """Test that CharField with choices is audit logged with old & new value"""
    app = ApplicationFactory(benefit_type=BenefitType.EMPLOYMENT_BENEFIT)
    app.benefit_type = BenefitType.SALARY_BENEFIT
    app.save()
    _audit_log_update_to_object(app)
    assert _latest_resilient_log_entry_changes() == [
        "benefit_type changed from employment_benefit to salary_benefit"
    ]


@pytest.mark.django_db
def test_boolean_field_change_is_logged():
    """Test that BooleanField change is audit logged with old & new value"""
    app = ApplicationFactory(archived=False)
    app.archived = True
    app.save()
    _audit_log_update_to_object(app)
    assert _latest_resilient_log_entry_changes() == [
        "archived changed from False to True"
    ]


@pytest.mark.django_db
def test_date_field_change_is_logged():
    """Test that DateField change is audit logged with old & new value"""
    app = ApplicationFactory(start_date=date(2023, 1, 2))
    app.start_date = date(2025, 10, 11)
    app.save()
    _audit_log_update_to_object(app)
    assert _latest_resilient_log_entry_changes() == [
        "start_date changed from 2023-01-02 to 2025-10-11"
    ]


@pytest.mark.django_db
def test_decimal_field_change_is_logged():
    """Test that DecimalField change is audit logged with old & new value"""
    emp = EmployeeFactory(monthly_pay="1234.56")
    emp.monthly_pay = Decimal("9988.77")
    emp.save()
    _audit_log_update_to_object(emp)
    assert _latest_resilient_log_entry_changes() == [
        "monthly_pay changed from 1234.56 to 9988.77"
    ]


@pytest.mark.django_db
def test_foreign_key_changes_are_logged():
    """Test that ForeignKey change is audit logged with old & new value"""
    # Changing from null foreign key value to a non-null value
    app = ApplicationFactory(handler=None)
    handler1 = UserFactory(pk="11111111-2222-3333-4444-555555555555")
    app.handler = handler1
    app.save()
    _audit_log_update_to_object(app)
    assert _latest_resilient_log_entry_changes() == [
        "handler changed from None to 11111111-2222-3333-4444-555555555555"
    ]
    # Changing from existing non-null foreign key value to another non-null value
    handler2 = UserFactory(pk="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
    app.handler = handler2
    app.save()
    _audit_log_update_to_object(app)
    assert _latest_resilient_log_entry_changes() == [
        "handler changed from 11111111-2222-3333-4444-555555555555 to "
        "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    ]


@pytest.mark.django_db
def test_file_field_changes_are_logged_as_filenames():
    """Test that FileField change is audit logged with old & new filename."""
    attachment = AttachmentFactory(
        application=ApplicationFactory(), attachment_file="old.pdf", content_type="pdf"
    )
    attachment.attachment_file.save("new.pdf", ContentFile("new data"))
    _audit_log_update_to_object(attachment)
    assert _latest_resilient_log_entry_changes() == [
        "attachment_file changed from old.pdf to new.pdf"
    ]


@pytest.mark.django_db
def test_multiple_field_changes_are_all_logged():
    """
    Test that multiple field changes are all logged in alphabetical field name order.

    django-simple-history's diff_against function sorts changes by field name:
    https://github.com/django-commons/django-simple-history/blob/3.10.1/simple_history/models.py#L1087
    """
    app = ApplicationFactory(
        archived=False, company_name="Old Co", start_date=date(2024, 12, 31)
    )
    app.company_name = "New Co"
    app.archived = True
    app.start_date = date(2025, 8, 1)
    app.save()
    _audit_log_update_to_object(app)
    assert _latest_resilient_log_entry_changes() == [
        "archived changed from False to True",
        "company_name changed from Old Co to New Co",
        "start_date changed from 2024-12-31 to 2025-08-01",
    ]


@pytest.mark.django_db
def test_sensitive_field_changes_are_not_logged():
    """
    Test that known sensitive fields' changes are not logged.

    Known sensitive fields:
    - encrypted_social_security_number, encrypted_first_name, encrypted_last_name
      first_name, last_name, social_security_number
    """
    emp = EmployeeFactory(
        first_name="Jane",
        last_name="Doe",
        encrypted_first_name="Jane",
        encrypted_last_name="Doe",
        social_security_number="010101-111C",
        encrypted_social_security_number="010101-111C",
        job_title="Lead Developer",
    )
    emp.first_name = emp.encrypted_first_name = "Alice"
    emp.last_name = emp.encrypted_last_name = "Doe-Smith"
    emp.social_security_number = emp.encrypted_social_security_number = "010101-1234"
    emp.job_title = "CTO"
    emp.save()
    _audit_log_update_to_object(emp)
    # Only the job_title is logged as it is the only non-sensitive field changed:
    assert _latest_resilient_log_entry_changes() == [
        "job_title changed from Lead Developer to CTO"
    ]


@pytest.mark.django_db
def test_m2m_field_changes_not_logged_because_not_configured():
    """
    Test using Application model that using `history = HistoricalRecords(...)` without
    passing a non-empty m2m_fields parameter means that M2M fields' changes won't be logged.

    NOTE: Application model's history could be configured to track M2M fields, see:
    https://django-simple-history.readthedocs.io/en/3.10.1/historical_model.html#tracking-many-to-many-relationships
    """
    # Test that Application's history model has not been configured to track M2M fields.
    # django-simple-history's create_history_model sets _history_m2m_fields attribute:
    # https://github.com/django-commons/django-simple-history/blob/3.10.1/simple_history/models.py#L300C14-L300C33
    history_model = Application.history.model
    assert history_model._history_m2m_fields == []

    # Because M2M fields are not configured, their changed values are not logged:
    app = ApplicationFactory()
    app.save()
    old_bases_count = app.bases.count()
    app.bases.add(ApplicationBasisFactory())
    app.save()
    assert app.bases.count() == old_bases_count + 1
    _audit_log_update_to_object(app)
    assert _latest_resilient_log_entry_changes() is None
