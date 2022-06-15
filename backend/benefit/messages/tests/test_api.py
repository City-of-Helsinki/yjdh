import uuid
from copy import deepcopy

import pytest
from django.conf import settings
from django.test import override_settings
from rest_framework.reverse import reverse

from applications.enums import ApplicationStatus
from applications.tests.factories import HandlingApplicationFactory
from applications.tests.test_applications_api import (
    get_detail_url,
    get_handler_detail_url,
)
from common.tests.conftest import get_client_user
from companies.tests.factories import CompanyFactory
from messages.models import Message, MessageType
from messages.tests.factories import MessageFactory
from shared.common.lang_test_utils import (
    assert_email_body_language,
    assert_email_subject_language,
)

SAMPLE_MESSAGE_PAYLOAD = {
    "content": "Sample message",
    "message_type": MessageType.APPLICANT_MESSAGE,
}


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-list",
        "handler-message-list",
        "handler-note-list",
    ],
)
def test_list_message_unauthenticated(
    anonymous_client, handling_application, view_name
):
    result = anonymous_client.get(
        reverse(view_name, kwargs={"application_pk": handling_application.pk})
    )
    assert result.status_code == 403


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-list",
        "handler-message-list",
        "handler-note-list",
    ],
)
def test_list_message_unauthorized(
    api_client, anonymous_handling_application, view_name
):
    if view_name == "applicant-message-list":
        # Cannot see application they doesn't belong to
        result = api_client.get(
            reverse(
                view_name, kwargs={"application_pk": anonymous_handling_application.pk}
            )
        )
        assert result.status_code == 404
    else:
        # Cannot use handler API endpoints
        result = api_client.get(
            reverse(
                view_name, kwargs={"application_pk": anonymous_handling_application.pk}
            )
        )
        assert result.status_code == 403


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-list",
        "handler-message-list",
    ],
)
def test_list_messages(
    api_client,
    handler_api_client,
    handling_application,
    mock_get_organisation_roles_and_create_company,
    view_name,
):
    handling_application.company = mock_get_organisation_roles_and_create_company
    handling_application.save()

    MessageFactory(
        application=handling_application, message_type=MessageType.APPLICANT_MESSAGE
    )
    MessageFactory(
        application=handling_application, message_type=MessageType.HANDLER_MESSAGE
    )
    MessageFactory(application=handling_application, message_type=MessageType.NOTE)
    MessageFactory(
        application=HandlingApplicationFactory(),
        message_type=MessageType.APPLICANT_MESSAGE,
    )
    assert Message.objects.count() == 4

    if view_name == "applicant-message-list":
        result = api_client.get(
            reverse(view_name, kwargs={"application_pk": handling_application.pk})
        )
        assert result.status_code == 200
        assert len(result.data) == 2
    else:
        result = handler_api_client.get(
            reverse(view_name, kwargs={"application_pk": handling_application.pk})
        )
        assert result.status_code == 200
        assert len(result.data) == 2


def test_list_notes(handler_api_client, handling_application):
    MessageFactory.create_batch(
        2, application=handling_application, message_type=MessageType.APPLICANT_MESSAGE
    )
    MessageFactory.create_batch(
        2, application=handling_application, message_type=MessageType.HANDLER_MESSAGE
    )
    MessageFactory.create_batch(
        2, application=handling_application, message_type=MessageType.NOTE
    )
    assert Message.objects.count() == 6
    result = handler_api_client.get(
        reverse("handler-note-list", kwargs={"application_pk": handling_application.pk})
    )
    assert result.status_code == 200
    assert len(result.data) == 2


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-list",
        "handler-message-list",
        "handler-note-list",
    ],
)
def test_create_message_unauthenticated(
    anonymous_client, handling_application, view_name
):
    result = anonymous_client.post(
        reverse(view_name, kwargs={"application_pk": handling_application.pk}),
        SAMPLE_MESSAGE_PAYLOAD,
    )
    assert result.status_code == 403


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-list",
        "handler-message-list",
        "handler-note-list",
    ],
)
def test_create_message_unauthorized(api_client, handling_application, view_name):
    handling_application.company = CompanyFactory()
    handling_application.save()
    if view_name == "applicant-message-list":
        result = api_client.post(
            reverse(view_name, kwargs={"application_pk": handling_application.pk}),
            SAMPLE_MESSAGE_PAYLOAD,
        )
    else:
        result = api_client.post(
            reverse(view_name, kwargs={"application_pk": handling_application.pk}),
            SAMPLE_MESSAGE_PAYLOAD,
        )
    assert result.status_code == 403


def test_create_applicant_message_invalid(
    api_client, application, mock_get_organisation_roles_and_create_company
):
    result = api_client.post(
        reverse("applicant-message-list", kwargs={"application_pk": uuid.uuid4()}),
        SAMPLE_MESSAGE_PAYLOAD,
    )
    assert result.status_code == 404

    msg = deepcopy(SAMPLE_MESSAGE_PAYLOAD)
    application.company = CompanyFactory()
    application.save()
    result = api_client.post(
        reverse("applicant-message-list", kwargs={"application_pk": application.pk}),
        msg,
    )
    assert result.status_code == 403

    application.company = mock_get_organisation_roles_and_create_company
    application.save()
    result = api_client.post(
        reverse("applicant-message-list", kwargs={"application_pk": application.pk}),
        msg,
    )
    assert result.status_code == 400
    assert "application is not in the correct status" in str(
        result.data["non_field_errors"]
    )

    application.status = ApplicationStatus.HANDLING
    application.save()
    msg["message_type"] = MessageType.HANDLER_MESSAGE
    result = api_client.post(
        reverse("applicant-message-list", kwargs={"application_pk": application.pk}),
        msg,
    )
    assert result.status_code == 400
    assert "Applicant is not allowed to do this action" in str(
        result.data["non_field_errors"]
    )


def test_create_handler_message_invalid(handler_api_client, handling_application):
    msg = deepcopy(SAMPLE_MESSAGE_PAYLOAD)
    msg["message_type"] = MessageType.APPLICANT_MESSAGE
    result = handler_api_client.post(
        reverse(
            "applicant-message-list", kwargs={"application_pk": handling_application.pk}
        ),
        msg,
    )
    assert result.status_code == 403

    assert "You do not have permission to perform this action." in str(
        result.data["detail"]
    )


@pytest.mark.parametrize(
    "status,expected_result",
    [
        (ApplicationStatus.DRAFT, 400),
        (ApplicationStatus.RECEIVED, 201),
        (ApplicationStatus.HANDLING, 201),
        (ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED, 201),
        (ApplicationStatus.ACCEPTED, 400),
        (ApplicationStatus.REJECTED, 400),
        (ApplicationStatus.CANCELLED, 400),
    ],
)
def test_applicant_send_first_message(
    api_client,
    handling_application,
    mock_get_organisation_roles_and_create_company,
    status,
    expected_result,
):
    msg = deepcopy(SAMPLE_MESSAGE_PAYLOAD)
    msg["message_type"] = MessageType.APPLICANT_MESSAGE
    handling_application.company = mock_get_organisation_roles_and_create_company
    handling_application.status = status
    handling_application.save()
    result = api_client.post(
        reverse(
            "applicant-message-list", kwargs={"application_pk": handling_application.pk}
        ),
        msg,
    )
    assert result.status_code == expected_result


@pytest.mark.parametrize(
    "view_name,msg_type,email_language",
    [
        ("applicant-message-list", MessageType.APPLICANT_MESSAGE, None),
        ("handler-message-list", MessageType.HANDLER_MESSAGE, "fi"),
        ("handler-message-list", MessageType.HANDLER_MESSAGE, "en"),
        ("handler-message-list", MessageType.HANDLER_MESSAGE, "sv"),
        ("handler-note-list", MessageType.NOTE, None),
    ],
)
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_create_message(
    api_client,
    handler_api_client,
    handling_application,
    mock_get_organisation_roles_and_create_company,
    view_name,
    msg_type,
    email_language,
    mailoutbox,
):
    msg = deepcopy(SAMPLE_MESSAGE_PAYLOAD)
    msg["message_type"] = msg_type
    if view_name == "applicant-message-list":
        user = get_client_user(api_client)
        MessageFactory(
            application=handling_application, message_type=MessageType.HANDLER_MESSAGE
        )
        handling_application.company = mock_get_organisation_roles_and_create_company
        handling_application.save()
        result = api_client.post(
            reverse(view_name, kwargs={"application_pk": handling_application.pk}),
            msg,
        )
        assert len(mailoutbox) == 0
    else:
        user = get_client_user(handler_api_client)
        if email_language:
            handling_application.applicant_language = email_language
            handling_application.save()
        result = handler_api_client.post(
            reverse(view_name, kwargs={"application_pk": handling_application.pk}),
            msg,
        )
        assert result.status_code == 201
        if email_language:
            assert len(mailoutbox) == 1
            assert_email_subject_language(str(mailoutbox[0].subject), email_language)
            assert_email_body_language(str(mailoutbox[0].body), email_language)
            if email_language == "fi":
                assert "Olet saanut uuden viestin" in mailoutbox[0].subject
                assert "on tullut uusi viesti" in mailoutbox[0].body
                assert mailoutbox[0].to == [
                    handling_application.company_contact_person_email
                ]
                assert mailoutbox[0].from_email == settings.DEFAULT_FROM_EMAIL

    assert result.status_code == 201
    message_qs = Message.objects.filter(message_type=msg_type)
    assert message_qs.count() == 1
    assert message_qs.first().application.id == handling_application.id
    assert message_qs.first().sender.id == user.id


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-detail",
        "handler-message-detail",
        "handler-note-detail",
    ],
)
def test_update_message_unauthenticated(
    anonymous_client, anonymous_handling_application, view_name
):
    message = MessageFactory()
    result = anonymous_client.put(
        reverse(
            view_name,
            kwargs={
                "application_pk": anonymous_handling_application.pk,
                "pk": message.id,
            },
        ),
        SAMPLE_MESSAGE_PAYLOAD,
    )
    assert result.status_code == 403


@pytest.mark.parametrize(
    "view_name,msg_type",
    [
        ("applicant-message-detail", MessageType.APPLICANT_MESSAGE),
        ("handler-message-detail", MessageType.HANDLER_MESSAGE),
        ("handler-note-detail", MessageType.NOTE),
    ],
)
def test_update_message_unauthorized(
    api_client,
    handler_api_client,
    handling_application,
    mock_get_organisation_roles_and_create_company,
    view_name,
    msg_type,
):
    msg = MessageFactory(application=handling_application, message_type=msg_type)
    if view_name == "applicant-message-detail":
        result = api_client.put(
            reverse(
                view_name,
                kwargs={"application_pk": handling_application.pk, "pk": msg.id},
            ),
            SAMPLE_MESSAGE_PAYLOAD,
        )
        assert result.status_code == 403
    else:
        result = handler_api_client.put(
            reverse(
                view_name,
                kwargs={"application_pk": handling_application.pk, "pk": msg.id},
            ),
            {
                "content": "Sample content",
                "message_type": msg_type,
            },
        )
        assert result.status_code == 403


def test_update_message_not_allowed(
    api_client,
    handler_api_client,
    mock_get_organisation_roles_and_create_company,
    handling_application,
):
    user = get_client_user(api_client)
    message = MessageFactory(
        application=handling_application,
        message_type=MessageType.APPLICANT_MESSAGE,
        sender=user,
    )
    handling_application.company = mock_get_organisation_roles_and_create_company
    handling_application.save()
    result = api_client.put(
        reverse(
            "applicant-message-detail",
            kwargs={"application_pk": handling_application.pk, "pk": message.id},
        ),
        SAMPLE_MESSAGE_PAYLOAD,
    )
    assert result.status_code == 403


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-detail",
        "handler-message-detail",
        "handler-note-detail",
    ],
)
def test_delete_message_unauthenticated(
    anonymous_client, handling_application, view_name
):
    message = MessageFactory()
    result = anonymous_client.delete(
        reverse(
            view_name,
            kwargs={"application_pk": handling_application.pk, "pk": message.id},
        )
    )
    assert result.status_code == 403


@pytest.mark.parametrize(
    "view_name",
    [
        ("applicant-message-detail"),
        ("handler-message-detail"),
    ],
)
def test_delete_message_unauthorized(
    api_client,
    handler_api_client,
    anonymous_handling_application,
    mock_get_organisation_roles_and_create_company,
    view_name,
):
    msg = MessageFactory(
        application=anonymous_handling_application,
        message_type=MessageType.APPLICANT_MESSAGE,
    )
    if view_name == "applicant-message-detail":
        result = api_client.delete(
            reverse(
                view_name,
                kwargs={
                    "application_pk": anonymous_handling_application.pk,
                    "pk": msg.id,
                },
            )
        )
        assert result.status_code == 404
    else:
        result = handler_api_client.delete(
            reverse(
                view_name,
                kwargs={
                    "application_pk": anonymous_handling_application.pk,
                    "pk": msg.id,
                },
            ),
        )
        assert result.status_code == 403


def test_delete_message(
    api_client,
    mock_get_organisation_roles_and_create_company,
    handling_application,
):
    user = get_client_user(api_client)
    message = MessageFactory(
        application=handling_application,
        message_type=MessageType.APPLICANT_MESSAGE,
        sender=user,
    )
    assert Message.objects.count() == 1
    handling_application.company = mock_get_organisation_roles_and_create_company
    handling_application.save()
    result = api_client.delete(
        reverse(
            "applicant-message-detail",
            kwargs={"application_pk": handling_application.pk, "pk": message.id},
        )
    )
    assert result.status_code == 204
    assert Message.objects.count() == 0


def test_applications_list_with_message_count(
    api_client, handling_application, handler_api_client
):
    msg = MessageFactory(application=handling_application)
    response = api_client.get(reverse("v1:applicant-application-list"))
    assert len(response.data) == 1
    assert response.status_code == 200
    assert response.data[0]["unread_messages_count"] == 1
    response = api_client.get(get_detail_url(handling_application))
    assert "unread_messages_count" in response.data
    assert response.data["unread_messages_count"] == 1

    response = handler_api_client.get(reverse("v1:handler-application-list"))
    assert len(response.data) == 1
    assert response.status_code == 200
    assert response.data[0]["unread_messages_count"] == 1
    response = handler_api_client.get(get_handler_detail_url(handling_application))
    assert "unread_messages_count" in response.data
    assert response.data["unread_messages_count"] == 1

    msg.seen_by_applicant = True
    msg.seen_by_handler = True
    msg.save()

    response = api_client.get(reverse("v1:applicant-application-list"))
    assert response.data[0]["unread_messages_count"] == 0
    response = api_client.get(get_detail_url(handling_application))
    assert "unread_messages_count" in response.data
    assert response.data["unread_messages_count"] == 0

    response = handler_api_client.get(reverse("v1:handler-application-list"))
    assert response.data[0]["unread_messages_count"] == 0
    response = handler_api_client.get(get_handler_detail_url(handling_application))
    assert "unread_messages_count" in response.data
    assert response.data["unread_messages_count"] == 0


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-list",
        "handler-message-list",
    ],
)
def test_list_messages_read_receipt(
    api_client,
    handler_api_client,
    handling_application,
    mock_get_organisation_roles_and_create_company,
    view_name,
):
    handling_application.company = mock_get_organisation_roles_and_create_company
    handling_application.save()

    MessageFactory(
        application=handling_application, message_type=MessageType.APPLICANT_MESSAGE
    )
    MessageFactory(
        application=handling_application, message_type=MessageType.HANDLER_MESSAGE
    )
    assert Message.objects.count() == 2
    assert Message.objects.filter(seen_by_applicant=True).count() == 0
    assert Message.objects.filter(seen_by_handler=True).count() == 0

    if view_name == "applicant-message-list":
        result = api_client.get(
            reverse(view_name, kwargs={"application_pk": handling_application.pk})
        )
        assert result.status_code == 200
        assert len(result.data) == 2
        assert Message.objects.filter(seen_by_applicant=True).count() == 2
        assert Message.objects.filter(seen_by_handler=True).count() == 0
    else:
        result = handler_api_client.get(
            reverse(view_name, kwargs={"application_pk": handling_application.pk})
        )
        assert result.status_code == 200
        assert Message.objects.filter(seen_by_applicant=True).count() == 0
        assert Message.objects.filter(seen_by_handler=True).count() == 2


def test_applications_list_with_message_count_multiple_messages(
    api_client, handling_application, handler_api_client
):
    MessageFactory(
        application=handling_application, message_type=MessageType.HANDLER_MESSAGE
    )
    MessageFactory(
        application=handling_application, message_type=MessageType.HANDLER_MESSAGE
    )
    response = api_client.get(reverse("v1:applicant-application-list"))
    assert len(response.data) == 1
    assert response.status_code == 200
    assert response.data[0]["unread_messages_count"] == 2
    response = api_client.get(get_detail_url(handling_application))
    assert "unread_messages_count" in response.data
    assert response.data["unread_messages_count"] == 2
