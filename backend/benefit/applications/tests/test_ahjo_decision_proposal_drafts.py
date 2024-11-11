from datetime import date

import pytest
from django.utils.translation import gettext_lazy as _
from rest_framework.reverse import reverse

from applications.enums import ApplicationStatus
from applications.models import AhjoDecisionText
from calculator.models import Calculation
from calculator.tests.factories import PaySubsidyFactory


def _prepare_calculation(application):
    application.calculation = Calculation(
        application=application,
        monthly_pay=1234,
        vacation_money=123,
        other_expenses=321,
        start_date=application.start_date,
        end_date=application.end_date,
        state_aid_max_percentage=50,
        calculated_benefit_amount=0,
        override_monthly_benefit_amount=None,
    )
    pay_subsidy = PaySubsidyFactory(
        pay_subsidy_percent=50, start_date=date(2021, 7, 10), end_date=date(2021, 9, 10)
    )
    application.pay_subsidies.add(pay_subsidy)
    application.calculation.save()
    application.save()


@pytest.mark.parametrize(
    """response_status,review_step,status,granted_as_de_minimis_aid,log_entry_comment,
    handler_role,decision_text,justification_text""",
    [
        (
            200,
            2,
            ApplicationStatus.ACCEPTED,
            False,
            None,
            None,
            None,
            None,
        ),
        (
            200,
            3,
            ApplicationStatus.ACCEPTED,
            False,
            None,
            "manager",
            "decision text",
            "justification text",
        ),
        (
            200,
            4,
            ApplicationStatus.ACCEPTED,
            False,
            None,
            "manager",
            "decision text",
            "justification text",
        ),
        (
            400,
            2,
            ApplicationStatus.REJECTED,
            False,
            "",
            "",
            "",
            "",
        ),
        (
            200,
            3,
            ApplicationStatus.REJECTED,
            False,
            "some log entry comment",
            "handler",
            "decision text",
            "justification text",
        ),
        (
            400,
            3,
            ApplicationStatus.REJECTED,
            False,
            "some log entry comment",
            "handler",
            "",
            "justification text",
        ),
        (
            400,
            3,
            ApplicationStatus.REJECTED,
            False,
            "some log entry comment",
            "handler",
            "decision text",
            "",
        ),
    ],
)
def test_decision_proposal_drafting(
    application,
    handler_api_client,
    response_status,
    review_step,
    status,
    granted_as_de_minimis_aid,
    log_entry_comment,
    handler_role,
    decision_text,
    justification_text,
    fake_decisionmakers,
    decision_maker_settings,
):
    if review_step == 4:
        _prepare_calculation(application=application)

    url = reverse("decision_proposal_draft_update")
    response = handler_api_client.patch(
        url,
        {
            "application_id": application.id,
            "review_step": review_step,
            "status": status,
            "log_entry_comment": log_entry_comment,
            "granted_as_de_minimis_aid": granted_as_de_minimis_aid,
            "handler_role": handler_role,
            "decision_text": decision_text,
            "justification_text": justification_text,
            "decision_maker_id": fake_decisionmakers[0]["ID"],
            "decision_maker_name": fake_decisionmakers[0]["Name"],
        },
    )
    assert response.status_code == response_status

    if review_step == 4:
        final_ahjo_text = AhjoDecisionText.objects.get(application=application)
        assert (
            final_ahjo_text.decision_text
            == f'<section id="paatos"><h1>{_("Päätös")}</h1>{decision_text}</section>\
<section id="paatoksenperustelut"><h1>{_("Päätöksen perustelut")}</h1>{justification_text}</section>'
        )

        assert final_ahjo_text.decision_maker_id == fake_decisionmakers[0]["ID"]
        assert final_ahjo_text.decision_maker_name == fake_decisionmakers[0]["Name"]
