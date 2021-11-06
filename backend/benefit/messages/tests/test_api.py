import uuid
from copy import deepcopy

import pytest
from applications.enums import ApplicationStatus
from applications.tests.factories import HandlingApplicationFactory
from common.tests.conftest import get_client_user
from companies.tests.factories import CompanyFactory
from messages.models import Message, MessageType
from messages.tests.factories import MessageFactory
from rest_framework.reverse import reverse

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
def test_list_message_unauthorized(api_client, handling_application, view_name):
    if view_name == "applicant-message-list":
        # Cannot see application they doesn't belong to
        result = api_client.get(
            reverse(view_name, kwargs={"application_pk": handling_application.pk})
        )
        assert result.status_code == 404
    else:
        # Cannot use handler API endpoints
        result = api_client.get(
            reverse(view_name, kwargs={"application_pk": handling_application.pk})
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
    assert "handling" in str(result.data["non_field_errors"])

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
    assert result.status_code == 400
    assert "Handler is not allowed to do this action" in str(
        result.data["non_field_errors"]
    )


@pytest.mark.parametrize(
    "view_name,msg_type",
    [
        ("applicant-message-list", MessageType.APPLICANT_MESSAGE),
        ("handler-message-list", MessageType.HANDLER_MESSAGE),
        ("handler-note-list", MessageType.NOTE),
    ],
)
def test_create_message(
    api_client,
    handler_api_client,
    handling_application,
    mock_get_organisation_roles_and_create_company,
    view_name,
    msg_type,
):
    msg = deepcopy(SAMPLE_MESSAGE_PAYLOAD)
    msg["message_type"] = msg_type
    if view_name == "applicant-message-list":
        user = get_client_user(api_client)
        handling_application.company = mock_get_organisation_roles_and_create_company
        handling_application.save()
        result = api_client.post(
            reverse(view_name, kwargs={"application_pk": handling_application.pk}),
            msg,
        )
        assert result.status_code == 201
    else:
        user = get_client_user(handler_api_client)
        result = handler_api_client.post(
            reverse(view_name, kwargs={"application_pk": handling_application.pk}),
            msg,
        )

    assert result.status_code == 201
    assert Message.objects.count() == 1
    assert Message.objects.first().application.id == handling_application.id
    assert Message.objects.first().sender.id == user.id


@pytest.mark.parametrize(
    "view_name",
    [
        "applicant-message-detail",
        "handler-message-detail",
        "handler-note-detail",
    ],
)
def test_update_message_unauthenticated(
    anonymous_client, handling_application, view_name
):
    message = MessageFactory()
    result = anonymous_client.put(
        reverse(
            view_name,
            kwargs={"application_pk": handling_application.pk, "pk": message.id},
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
        assert result.status_code == 404
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


def test_update_message(
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
    assert result.status_code == 200
    message.refresh_from_db()
    assert message.content == SAMPLE_MESSAGE_PAYLOAD["content"]


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
    "view_name,msg_type",
    [
        ("applicant-message-detail", MessageType.APPLICANT_MESSAGE),
        ("handler-message-detail", MessageType.HANDLER_MESSAGE),
        ("handler-note-detail", MessageType.NOTE),
    ],
)
def test_delete_message_unauthorized(
    api_client,
    handler_api_client,
    handling_application,
    mock_get_organisation_roles_and_create_company,
    view_name,
    msg_type,
):
    msg = MessageFactory(application=handling_application, message_type=msg_type)
    if view_name == "applicant-message-detail":
        result = api_client.delete(
            reverse(
                view_name,
                kwargs={"application_pk": handling_application.pk, "pk": msg.id},
            )
        )
        assert result.status_code == 404
    else:
        result = handler_api_client.delete(
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


def test_delete_message(
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
