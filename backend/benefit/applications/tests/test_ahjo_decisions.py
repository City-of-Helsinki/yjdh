import uuid

import pytest
from rest_framework.reverse import reverse

from applications.enums import DecisionType
from applications.models import AhjoDecisionText
from applications.services.ahjo_decision_service import (
    replace_decision_template_placeholders,
)


def test_replace_accepted_decision_template_placeholders(
    decided_application, accepted_ahjo_decision_section
):
    replaced_template = replace_decision_template_placeholders(
        accepted_ahjo_decision_section.template_decision_text,
        accepted_ahjo_decision_section.decision_type,
        decided_application,
    )

    assert decided_application.company.name in replaced_template
    assert (
        f"{decided_application.calculation.calculated_benefit_amount}"
        in replaced_template
    )
    wanted_start_date = decided_application.calculation.start_date.strftime("%d.%m.%Y")
    wanted_end_date = decided_application.calculation.end_date.strftime("%d.%m.%Y")
    assert f"{wanted_start_date} - {wanted_end_date}" in replaced_template


def test_replace_denied_decision_template_placeholders(
    decided_application, denied_ahjo_decision_section
):
    replaced_template = replace_decision_template_placeholders(
        denied_ahjo_decision_section.template_decision_text,
        denied_ahjo_decision_section.decision_type,
        decided_application,
    )

    assert decided_application.company.name in replaced_template


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


def test_decision_text_api_unauthenticated(anonymous_client, decided_application):
    url = get_decisions_list_url(decided_application.id)
    response = anonymous_client.post(url)
    assert response.status_code == 403


@pytest.mark.parametrize(
    "decision_type, language",
    [
        (DecisionType.ACCEPTED, "fi"),
        (DecisionType.ACCEPTED, "sv"),
        (DecisionType.DENIED, "fi"),
        (DecisionType.DENIED, "sv"),
    ],
)
@pytest.mark.django_db
def test_decision_text_api_post(
    decided_application, handler_api_client, decision_type, language
):
    url = get_decisions_list_url(decided_application.id)
    data = {
        "decision_type": decision_type,
        "decision_text": "Test decision text",
        "language": language,
    }
    response = handler_api_client.post(url, data)
    assert response.status_code == 201
    decision_text = AhjoDecisionText.objects.get(application=decided_application)
    assert decision_text.decision_type == decision_type
    assert decision_text.decision_text == "Test decision text"
    assert decision_text.language == language


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


def test_decision_text_api_put(decided_application, handler_api_client):
    decision_text = AhjoDecisionText.objects.create(
        application=decided_application,
        decision_type=DecisionType.ACCEPTED,
        decision_text="Test decision text",
        language="fi",
    )
    url = get_decisions_detail_url(decided_application.id, decision_text.id)
    data = {
        "decision_type": DecisionType.DENIED,
        "decision_text": "Uppdated Test decision text",
        "language": "sv",
    }
    response = handler_api_client.put(url, data)
    assert response.status_code == 200
    decision_text.refresh_from_db()
    assert decision_text.decision_type == data["decision_type"]
    assert decision_text.language == data["language"]
    assert decision_text.decision_text == data["decision_text"]
