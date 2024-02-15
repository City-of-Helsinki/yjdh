from string import Template
from typing import List

from applications.enums import DecisionProposalTemplateSectionType
from applications.models import Application, DecisionProposalTemplateSection


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
