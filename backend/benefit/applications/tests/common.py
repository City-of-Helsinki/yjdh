import csv
import datetime
import decimal

import pytest

from applications.enums import DecisionType
from applications.models import AhjoDecisionText, Application
from applications.services.ahjo_decision_service import (
    replace_decision_template_placeholders,
)
from applications.services.csv_export_base import CsvExportBase
from applications.tests.factories import (
    AcceptedDecisionProposalFactory,
    AcceptedDecisionProposalJustificationFactory,
    DeniedDecisionProposalFactory,
    DeniedDecisionProposalJustificationFactory,
)


def check_csv_cell_list_lines_generator(
    csv_export: CsvExportBase, expected_row_count_with_header
):
    assert expected_row_count_with_header >= 1
    lines_generator = csv_export.get_csv_cell_list_lines_generator()

    rows = [next(lines_generator) for _ in range(expected_row_count_with_header)]
    with pytest.raises(StopIteration):
        next(lines_generator)

    for row in rows:
        assert isinstance(row, list)
        for column in row:
            assert isinstance(column, (str, int, decimal.Decimal, datetime.date))

    header_row = rows[0]
    assert header_row == [column.heading for column in csv_export.CSV_COLUMNS]


def check_csv_string_lines_generator(
    csv_export: CsvExportBase, expected_row_count_with_header
):
    assert expected_row_count_with_header >= 1
    lines_generator = csv_export.get_csv_string_lines_generator()

    rows = [next(lines_generator) for _ in range(expected_row_count_with_header)]
    with pytest.raises(StopIteration):
        next(lines_generator)

    default_csv_dialect = csv.get_dialect("excel")

    for row in rows:
        assert isinstance(row, str)
        assert row.endswith(default_csv_dialect.lineterminator)

    header_row = rows[0]
    assert (
        header_row
        == csv_export.CSV_DELIMITER.join(
            (f'"{column.heading}"' for column in csv_export.CSV_COLUMNS)
        )
        + default_csv_dialect.lineterminator
    )


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
    decision_string = f"""<body><section id="paatos">{decision_section.template_text}</section>\
<section id="paatoksenperustelut">{justification_section.template_text}</section></body>"""

    return replace_decision_template_placeholders(decision_string, application)
