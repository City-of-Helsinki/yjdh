from unittest.mock import Mock

import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.messages.storage.fallback import FallbackStorage
from django.core import mail
from django.test import RequestFactory
from django.urls import reverse

from applications.admin import EmailTemplateAdmin
from applications.enums import EmailTemplateType
from applications.models import EmailTemplate
from shared.common.tests.factories import UserFactory


@pytest.fixture
def email_template_admin():
    return EmailTemplateAdmin(EmailTemplate, AdminSite())


@pytest.fixture
def user_with_email():
    return UserFactory(email="testuser@example.com")


@pytest.fixture
def user_without_email():
    return UserFactory(email="")


@pytest.mark.django_db
def test_send_to_me_action_success(email_template_admin, user_with_email, settings):
    # Ensure template exists (seeded by conftest)
    template = EmailTemplate.objects.get(
        type=EmailTemplateType.PROCESSING,
        language="fi",
    )
    template.subject = "Test Subject"
    template.html_body = "<p>Test Body</p>"
    template.save()

    factory = RequestFactory()
    request = factory.post(reverse("admin:applications_emailtemplate_changelist"))
    request.user = user_with_email

    # Fix message storage
    request.session = Mock()
    storage = FallbackStorage(request)
    request._messages = storage

    queryset = EmailTemplate.objects.filter(pk=template.pk)

    email_template_admin.send_to_me(request, queryset)

    assert len(mail.outbox) == 1
    sent_email = mail.outbox[0]
    assert sent_email.subject == "Test Subject"
    assert sent_email.to == [user_with_email.email]

    # Check success message
    msgs = [msg.message for msg in storage]
    assert any("Successfully sent 1 email" in m for m in msgs)


@pytest.mark.django_db
def test_send_to_me_action_no_email_configured(
    email_template_admin, user_without_email
):
    template = EmailTemplate.objects.get(
        type=EmailTemplateType.PROCESSING,
        language="fi",
    )

    factory = RequestFactory()
    request = factory.post(reverse("admin:applications_emailtemplate_changelist"))
    request.user = user_without_email

    # Fix message storage
    request.session = Mock()
    storage = FallbackStorage(request)
    request._messages = storage

    queryset = EmailTemplate.objects.filter(pk=template.pk)

    email_template_admin.send_to_me(request, queryset)

    assert len(mail.outbox) == 0

    # Check error message
    msgs = [msg.message for msg in storage]
    assert any("You do not have an email address configured" in m for m in msgs)
