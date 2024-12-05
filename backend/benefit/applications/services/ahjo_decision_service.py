from string import Template
from typing import List

from django.conf import settings

from applications.enums import DecisionType
from applications.models import (
    AhjoDecisionText,
    Application,
    DecisionProposalTemplateSection,
)
from applications.services.ahjo.exceptions import AhjoDecisionError
from applications.tests.factories import (
    AcceptedDecisionProposalFactory,
    DeniedDecisionProposalFactory,
)


def replace_decision_template_placeholders(
    text_to_replace: str,
    decision_type: DecisionType,
    application: Application,
    decision_maker=None,
) -> str:
    """Replace the placeholders starting with $ in the decision template with real data"""
    text_to_replace = Template(text_to_replace)
    start_date = (
        application.calculation.start_date.strftime("%d.%m.%Y")
        if decision_type == DecisionType.ACCEPTED
        else application.start_date
    )
    end_date = (
        application.calculation.end_date.strftime("%d.%m.%Y")
        if decision_type == DecisionType.ACCEPTED
        else application.end_date
    )
    try:
        return text_to_replace.substitute(
            company=application.company.name,
            decision_maker=decision_maker,
            total_amount=(
                int(application.calculation.calculated_benefit_amount)
                if decision_type == DecisionType.ACCEPTED
                else ""
            ),
            benefit_date_range=(f"{start_date} - {end_date}"),
        )
    except AhjoDecisionError as e:
        raise ValueError(f"Error in preparing the decision proposal template: {e}")


def process_template_sections(
    template_sections: List[DecisionProposalTemplateSection],
    application: Application,
) -> List[DecisionProposalTemplateSection]:
    """Loop through the template sections and conditionally
    replace placeholders if section is a decision section"""
    for section in template_sections:
        section.template_decision_text = replace_decision_template_placeholders(
            section.template_decision_text, section.decision_type, application
        )
        section.template_justification_text = replace_decision_template_placeholders(
            section.template_justification_text, section.decision_type, application
        )
    return template_sections


def create_decision_text_for_application(
    application: Application, decision_type: DecisionType = DecisionType.ACCEPTED
) -> AhjoDecisionText:
    """An utility function to create a decision text for an application.
    Used for testing and seeding purposes."""
    text = _generate_decision_text_string(application, decision_type)
    _set_handler_to_ahjo_test_user(application)
    return AhjoDecisionText.objects.create(
        application=application,
        decision_text=text,
        decision_type=decision_type,
    )


def _set_handler_to_ahjo_test_user(application: Application) -> None:
    """An utility function to set the handler of an application to the Ahjo test user.
    Used only for testing purposes."""
    handler = application.calculation.handler
    handler.first_name = settings.AHJO_TEST_USER_FIRST_NAME
    handler.last_name = settings.AHJO_TEST_USER_LAST_NAME
    handler.ad_username = settings.AHJO_TEST_USER_AD_USERNAME
    handler.save()


def _generate_decision_text_string(
    application: Application, decision_type: DecisionType
) -> str:
    if decision_type == DecisionType.ACCEPTED:
        decision_section = AcceptedDecisionProposalFactory()
    else:
        decision_section = DeniedDecisionProposalFactory()
    decision_string = f"""<section id="paatos"><h1>Päätös</h1>{decision_section.template_decision_text}</section>\
<section id="paatoksenperustelut"><h1>Päätöksen perustelut</h1>{decision_section.template_justification_text}</section>"""  # noqa
    decision_type = decision_section.decision_type
    return replace_decision_template_placeholders(
        decision_string, decision_type, application
    )
