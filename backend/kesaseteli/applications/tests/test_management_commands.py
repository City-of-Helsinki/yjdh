from io import StringIO
from unittest import mock

import pytest
from django.core.management import call_command


@pytest.mark.django_db
@mock.patch("applications.services.EmailTemplateService.ensure_templates_exist")
def test_ensure_email_templates_command_created(mock_ensure):
    mock_ensure.return_value = 5  # Simulate 5 templates created
    out = StringIO()

    call_command("ensure_email_templates", stdout=out)

    output = out.getvalue()
    assert "Checking email templates..." in output
    assert "Successfully created/updated 5 missing templates." in output
    mock_ensure.assert_called_once()


@pytest.mark.django_db
@mock.patch("applications.services.EmailTemplateService.ensure_templates_exist")
def test_ensure_email_templates_command_no_changes(mock_ensure):
    mock_ensure.return_value = 0  # Simulate no changes
    out = StringIO()

    call_command("ensure_email_templates", stdout=out)

    output = out.getvalue()
    assert "Checking email templates..." in output
    assert "All templates already exist." in output
    mock_ensure.assert_called_once()
