import uuid

import pytest
from rest_framework.reverse import reverse

from applications.api.v1.serializers.decision_text import DecisionTextSerializer
from applications.enums import DecisionType
from applications.models import AhjoDecisionText
from applications.services.ahjo_decision_service import (
    replace_decision_template_placeholders,
)


@pytest.mark.django_db
def test_replace_accepted_decision_template_placeholders(
    decided_application, accepted_ahjo_decision_section
):
    replaced_template = replace_decision_template_placeholders(
        accepted_ahjo_decision_section.template_decision_text,
        accepted_ahjo_decision_section.decision_type,
        decided_application,
    )
    total_amount = int(decided_application.calculation.calculated_benefit_amount)
    assert decided_application.company.name in replaced_template
    assert f"{total_amount}" in replaced_template
    wanted_start_date = decided_application.calculation.start_date.strftime("%d.%m.%Y")
    wanted_end_date = decided_application.calculation.end_date.strftime("%d.%m.%Y")
    assert f"{wanted_start_date} - {wanted_end_date}" in replaced_template


@pytest.mark.django_db
def test_replace_denied_decision_template_placeholders(
    decided_application, denied_ahjo_decision_section
):
    replaced_template = replace_decision_template_placeholders(
        denied_ahjo_decision_section.template_decision_text,
        denied_ahjo_decision_section.decision_type,
        decided_application,
    )

    assert decided_application.company.name in replaced_template


@pytest.mark.django_db
def test_anonymous_client_cannot_access_templates(
    anonymous_client, decided_application
):
    url = f"""{reverse("template_section_list")}?application_id={decided_application.id}"""
    response = anonymous_client.get(url)
    assert response.status_code == 403


@pytest.mark.parametrize(
    "decision_type",
    [
        (DecisionType.ACCEPTED,),
        (DecisionType.ACCEPTED,),
        (DecisionType.DENIED,),
        (DecisionType.DENIED,),
    ],
)
@pytest.mark.django_db
def test_handler_gets_the_template_sections(
    decided_application, handler_api_client, decision_type
):
    url = f"""{reverse("template_section_list")}?application_id={decided_application.id}\
&decision_type={decision_type}"""
    response = handler_api_client.get(url)
    assert response.status_code == 200
    for template in response.data:
        assert template.decision_type == decision_type
        assert decided_application.company.name in template.template_decision_text


def get_decisions_list_url(application_id: uuid) -> str:
    return reverse("handler-decisions-list", kwargs={"application_id": application_id})


def get_decisions_detail_url(application_id: uuid, decision_text_id: uuid) -> str:
    return reverse(
        "handler-decisions-detail",
        kwargs={
            "application_id": application_id,
            "decision_id": decision_text_id,
        },
    )


@pytest.mark.django_db
def test_decision_text_api_unauthenticated(anonymous_client, decided_application):
    url = get_decisions_list_url(decided_application.id)
    response = anonymous_client.post(url)
    assert response.status_code == 403


@pytest.mark.parametrize(
    "decision_type, language, status_code",
    [
        (DecisionType.ACCEPTED, "fi", 201),
        (DecisionType.ACCEPTED, "sv", 201),
        (DecisionType.DENIED, "fi", 201),
        (DecisionType.DENIED, "sv", 201),
    ],
)
@pytest.mark.django_db
def test_decision_text_api_post(
    decided_application,
    handler_api_client,
    decision_type,
    language,
    fake_decisionmakers,
    status_code,
    fake_signers,
):
    url = get_decisions_list_url(decided_application.id)
    data = {
        "decision_type": decision_type,
        "decision_text": "Test decision text",
        "language": language,
        "decision_maker_id": fake_decisionmakers[0]["ID"],
        "decision_maker_name": fake_decisionmakers[0]["Name"],
        "signer_id": fake_signers[0]["ID"],
        "signer_name": fake_signers[0]["Name"],
    }
    response = handler_api_client.post(url, data)
    assert response.status_code == status_code
    decision_text = AhjoDecisionText.objects.get(application=decided_application)
    assert decision_text.decision_type == decision_type
    assert decision_text.decision_text == "Test decision text"
    assert decision_text.language == language
    assert decision_text.decision_maker_id == fake_decisionmakers[0]["ID"]
    assert decision_text.decision_maker_name == fake_decisionmakers[0]["Name"]


@pytest.mark.parametrize(
    "decision_type, language, status_code",
    [
        (DecisionType.ACCEPTED, "fi", 400),
        (DecisionType.ACCEPTED, "sv", 400),
        (DecisionType.DENIED, "fi", 400),
        (DecisionType.DENIED, "sv", 400),
    ],
)
@pytest.mark.django_db
def test_decision_text_api_without_decision_maker_data(
    decided_application,
    handler_api_client,
    decision_type,
    language,
    status_code,
    fake_decisionmakers,
):
    url = get_decisions_list_url(decided_application.id)

    data = {
        "decision_type": decision_type,
        "decision_text": "Test decision text",
        "language": language,
        "decision_maker_id": None,
        "decision_maker_name": None,
    }

    response = handler_api_client.post(url, data)
    assert response.status_code == status_code

    decision_text = AhjoDecisionText.objects.create(
        application=decided_application,
        decision_type=DecisionType.ACCEPTED,
        decision_text="Test decision text",
        language="fi",
        decision_maker_id=fake_decisionmakers[0]["ID"],
        decision_maker_name=fake_decisionmakers[0]["Name"],
    )

    url = get_decisions_detail_url(decided_application.id, decision_text.id)

    response = handler_api_client.put(url, data)
    assert response.status_code == status_code


@pytest.mark.parametrize(
    "decision_type, language",
    [
        (DecisionType.ACCEPTED, "fi"),
        (
            DecisionType.ACCEPTED,
            "sv",
        ),
        (
            DecisionType.DENIED,
            "fi",
        ),
        (
            DecisionType.DENIED,
            "sv",
        ),
    ],
)
@pytest.mark.django_db
def test_decision_text_serializer_validation_errors(decision_type, language):
    invalid_data = {
        "decision_type": decision_type,
        "decision_text": "Test decision text",
        "language": language,
        "decision_maker_id": None,
        "decision_maker_name": None,
    }

    serializer = DecisionTextSerializer(data=invalid_data)

    assert not serializer.is_valid()

    assert "decision_maker_name" in serializer.errors
    assert "decision_maker_id" in serializer.errors

    assert serializer.errors["decision_maker_name"] == ["This field is required."]
    assert serializer.errors["decision_maker_id"] == ["This field is required."]


@pytest.mark.django_db
def test_decision_text_api_get(decided_application, handler_api_client):
    url = get_decisions_list_url(decided_application.id)
    decision_text = AhjoDecisionText.objects.create(
        application=decided_application,
        decision_type=DecisionType.ACCEPTED,
        decision_text="Test decision text",
        language="fi",
    )
    response = handler_api_client.get(url)
    assert response.status_code == 200
    assert response.data["decision_text"] == decision_text.decision_text
    assert response.data["decision_type"] == decision_text.decision_type
    assert response.data["language"] == decision_text.language


@pytest.mark.django_db
def test_decision_text_api_put(
    decided_application, handler_api_client, fake_decisionmakers, fake_signers
):
    decision_text = AhjoDecisionText.objects.create(
        application=decided_application,
        decision_type=DecisionType.ACCEPTED,
        decision_text="Test decision text",
        language="fi",
        decision_maker_id=fake_decisionmakers[0]["ID"],
        decision_maker_name=fake_decisionmakers[0]["Name"],
        signer_id=fake_signers[0]["ID"],
        signer_name=fake_signers[0]["Name"],
    )
    url = get_decisions_detail_url(decided_application.id, decision_text.id)
    data = {
        "decision_type": DecisionType.DENIED,
        "decision_text": "Uppdated Test decision text",
        "language": "sv",
        "decision_maker_id": fake_decisionmakers[1]["ID"],
        "decision_maker_name": fake_decisionmakers[1]["Name"],
        "signer_id": fake_signers[1]["ID"],
        "signer_name": fake_signers[1]["Name"],
    }
    response = handler_api_client.put(url, data)
    assert response.status_code == 200
    decision_text.refresh_from_db()
    assert decision_text.decision_type == data["decision_type"]
    assert decision_text.language == data["language"]
    assert decision_text.decision_text == data["decision_text"]
    assert decision_text.decision_maker_id == data["decision_maker_id"]
    assert decision_text.decision_maker_name == data["decision_maker_name"]
    assert decision_text.signer_id == data["signer_id"]
    assert decision_text.signer_name == data["signer_name"]
