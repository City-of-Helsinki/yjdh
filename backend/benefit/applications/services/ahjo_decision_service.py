from string import Template
from typing import List

from applications.enums import DecisionProposalTemplateSectionType, DecisionType
from applications.models import (
    AhjoDecisionText,
    Application,
    DecisionProposalTemplateSection,
)
from applications.tests.factories import (
    AcceptedDecisionProposalFactory,
    AcceptedDecisionProposalJustificationFactory,
    DeniedDecisionProposalFactory,
    DeniedDecisionProposalJustificationFactory,
)




def replace_decision_template_placeholders(
    text_to_replace: str,
    application: Application,
    decision_maker: str = "Päättäjä x (Helsinki-lisä-suunnittelija/Tiimipäällikkö)",
) -> str:
    """Replace the placeholders starting with $ in the decision template with real data"""
    text_to_replace = Template(text_to_replace)
    try:
        return text_to_replace.substitute(
            decision_maker=decision_maker,
            company=application.company.name,
            total_amount=application.calculation.calculated_benefit_amount,
            benefit_date_range=f"{application.calculation.start_date}-{application.calculation.end_date}",
        )
    except Exception as e:
        raise ValueError(f"Error in preparing the decision proposal template: {e}")


def process_template_sections(
    template_sections: List[DecisionProposalTemplateSection],
    application: Application,
) -> List[DecisionProposalTemplateSection]:
    """Loop through the template sections and conditionally
    replace placeholders if section is a decision section"""
    for section in template_sections:
        if section.section_type == DecisionProposalTemplateSectionType.DECISION_SECTION:
            section.template_text = replace_decision_template_placeholders(
                section.template_text, application
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
    handler.first_name = "AhjoHYTvalmTA1H2"
    handler.last_name = "AhjoHyte2"
    handler.ad_username = "ahjohytvalmta1h2"
    handler.save()


def _generate_decision_text_string(
    application: Application, decision_type: DecisionType
) -> str:
    if decision_type == DecisionType.ACCEPTED:
        decision_section = AcceptedDecisionProposalFactory()
        justification_section = AcceptedDecisionProposalJustificationFactory()
    else:
        decision_section = DeniedDecisionProposalFactory()
        justification_section = DeniedDecisionProposalJustificationFactory()
    decision_string = f"""<body><section id="paatos"><h1>Päätös</h1>{decision_section.template_text}</section>\
<section id="paatoksenperustelut"><h1>Päätösteksti</h1>{justification_section.template_text}</section></body>"""

    return replace_decision_template_placeholders(decision_string, application)
