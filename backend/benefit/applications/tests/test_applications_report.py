import decimal
import io
import os.path
from collections import defaultdict
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Dict, List
from zipfile import ZipFile

import pytest
from dateutil.relativedelta import relativedelta
from django.http import HttpResponse, StreamingHttpResponse
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from applications.enums import (
    AhjoDecision,
    ApplicationStatus,
    BenefitType,
    PaySubsidyGranted,
)
from applications.models import AhjoSetting, ApplicationAlteration, ApplicationBatch
from applications.services.applications_csv_report import (
    format_bool,
    format_datetime,
    get_application_origin_label,
)
from applications.tests.common import (
    check_csv_cell_list_lines_generator,
    check_csv_string_lines_generator,
)
from applications.tests.conftest import *  # noqa
from applications.tests.conftest import split_lines_at_semicolon
from applications.tests.factories import DecidedApplicationFactory, DeMinimisAidFactory
from calculator.enums import InstalmentStatus
from calculator.models import Instalment
from calculator.tests.factories import PaySubsidyFactory
from common.tests.conftest import *  # noqa
from companies.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa
from terms.tests.conftest import *  # noqa


@pytest.fixture(autouse=True)
def run_before_and_after_tests():
    from applications.tests.before_after import before_test_reseed

    before_test_reseed([])
    yield


def get_filenames_grouped_by_extension_from_zip(
    archive: ZipFile,
) -> Dict[str, List[str]]:
    extension_to_filenames = defaultdict(list)
    for filename in archive.namelist():
        file_extension = os.path.splitext(filename)[1]
        extension_to_filenames[file_extension].append(filename)
    return extension_to_filenames


def _test_csv(
    csv_lines: List[List[str]],
    expected_application_numbers: List[int],
    expected_without_quotes: bool = False,
) -> None:
    # print(expected_without_quotes)
    if expected_without_quotes:
        not_found_message = "Ei löytynyt ehdot täyttäviä hakemuksia"
        application_number = "Hakemusnumero"
    else:
        not_found_message = '"Ei löytynyt ehdot täyttäviä hakemuksia"'
        application_number = '"Hakemusnumero"'

    if not expected_application_numbers:
        assert len(csv_lines) == 2
        assert csv_lines[1][0] == not_found_message
    else:
        assert csv_lines[0][0] == application_number
        assert len(csv_lines) == len(expected_application_numbers) + 1
        for line, expected_application_number in zip(
            csv_lines[1:], expected_application_numbers
        ):
            assert int(line[0]) == expected_application_number


def _get_csv_from_zip(zip_content: bytes) -> bytes:
    archive: ZipFile = ZipFile(io.BytesIO(zip_content))
    csv_names = get_filenames_grouped_by_extension_from_zip(archive).get(".csv", [])
    assert len(csv_names) == 1, "There must be a single .csv file in the zip file"
    return archive.read(csv_names[0])


def _get_csv(
    handler_api_client: APIClient,
    url: str,
    expected_application_numbers: List[int],
    from_zip: bool = False,
    expected_without_quotes: bool = False,
) -> List[List[str]]:
    response = handler_api_client.get(url)
    assert response.status_code == 200
    if from_zip:
        assert isinstance(response, HttpResponse)
        csv_content: bytes = _get_csv_from_zip(response.content)
    else:
        assert isinstance(response, StreamingHttpResponse)
        csv_content: bytes = response.getvalue()
    csv_lines = split_lines_at_semicolon(csv_content.decode("utf-8"))
    _test_csv(csv_lines, expected_application_numbers, expected_without_quotes)
    return csv_lines


def _get_csv_pdf_zip(handler_api_client: APIClient, url: str) -> ZipFile:
    response = handler_api_client.get(url)
    assert response.status_code == 200
    return ZipFile(io.BytesIO(response.content))


def _create_applications_for_export():
    application1 = DecidedApplicationFactory(status=ApplicationStatus.ACCEPTED)
    application1.log_entries.filter(to_status=ApplicationStatus.ACCEPTED).update(
        created_at=datetime(2022, 1, 1, tzinfo=timezone.utc)
    )
    application2 = DecidedApplicationFactory(status=ApplicationStatus.ACCEPTED)
    application2.log_entries.filter(to_status=ApplicationStatus.ACCEPTED).update(
        created_at=datetime(2022, 2, 1, tzinfo=timezone.utc)
    )
    application3 = DecidedApplicationFactory(status=ApplicationStatus.REJECTED)
    application3.log_entries.filter(to_status=ApplicationStatus.REJECTED).update(
        created_at=datetime(2022, 3, 1, tzinfo=timezone.utc)
    )
    application4 = DecidedApplicationFactory(
        status=ApplicationStatus.HANDLING
    )  # should be excluded
    application4.log_entries.filter(to_status=ApplicationStatus.HANDLING).update(
        created_at=datetime(2022, 2, 1, tzinfo=timezone.utc)
    )
    return (application1, application2, application3, application4)


@pytest.mark.skip(
    reason=(
        "This test fails in deploy pipeline - DETAIL:  Key"
        " (username)=(masonzachary_a45eb8) already exists."
    )
)
def test_applications_csv_export_new_applications(handler_api_client):
    (
        application1,
        application2,
        application3,
        _,
    ) = _create_applications_for_export()
    ApplicationBatch.objects.all().delete()

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_new_rejected_applications_csv_pdf/",
        [application3.application_number],
        from_zip=True,
    )
    assert ApplicationBatch.objects.all().count() == 1
    assert ApplicationBatch.objects.all().first().applications.count() == 1
    assert (
        ApplicationBatch.objects.filter(
            proposal_for_decision=AhjoDecision.DECIDED_REJECTED
        )
        .first()
        .applications.first()
        == application3
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_new_accepted_applications_csv_pdf/",
        [application1.application_number, application2.application_number],
        from_zip=True,
        expected_without_quotes=True,
    )
    assert ApplicationBatch.objects.all().count() == 2
    assert set(
        [
            a.pk
            for a in (
                ApplicationBatch.objects.filter(
                    proposal_for_decision=AhjoDecision.DECIDED_ACCEPTED
                )
                .first()
                .applications.all()
            )
        ]
    ) == {application1.pk, application2.pk}

    # re-running the request results in an empty response and doesn't create new batches
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_new_rejected_applications_csv_pdf/",
        [],
        from_zip=True,
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_new_accepted_applications_csv_pdf/",
        [],
        from_zip=True,
        expected_without_quotes=True,
    )
    assert ApplicationBatch.objects.all().count() == 2


def test_application_alteration_csv_export(
    application_alteration, handler_api_client, decided_application
):
    AhjoSetting.objects.create(
        name="application_alteration_fields",
        data={
            "account_number": "FI1234567890",
            "billing_department": "1800 Kaupunginkanslia (Kansl)",
        },
    )

    url = (
        reverse("v1:handler-application-alteration-list")
        + f"update_with_csv/?application_id={decided_application.pk}&"
        + f"alteration_id={application_alteration.id}"
    )
    payload = {
        "application": decided_application.pk,
        "recovery_start_date": "2024-10-02",
        "recovery_end_date": "2024-11-01",
        "recovery_amount": "200",
        "recovery_justification": "For reasons",
        "is_recoverable": True,
    }
    response = handler_api_client.patch(url, payload)
    assert response.status_code == 200

    updated_alteration = ApplicationAlteration.objects.get(pk=application_alteration.pk)

    assert updated_alteration.recovery_start_date == date(2024, 10, 2)
    assert updated_alteration.recovery_end_date == date(2024, 11, 1)
    assert updated_alteration.recovery_amount == Decimal("200")
    assert updated_alteration.recovery_justification == "For reasons"


def test_applications_csv_export_without_calculation(
    handler_api_client, received_application
):
    received_application.calculation.delete()
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_csv/",
        [
            received_application.application_number,
        ],
    )


def test_applications_csv_export_with_date_range(handler_api_client):
    (
        application1,
        application2,
        application3,
        application4,
    ) = _create_applications_for_export()
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_csv/",
        [
            application1.application_number,
            application2.application_number,
            application3.application_number,
            application4.application_number,
        ],
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_csv/?status=accepted,rejected",
        [
            application1.application_number,
            application2.application_number,
            application3.application_number,
        ],
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_after=2022-01-02",
        [application2.application_number, application3.application_number],
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_after=2021-12-31&handled_at_before=2022-03-02",
        [
            application1.application_number,
            application2.application_number,
            application3.application_number,
        ],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_after=2022-01-01&handled_at_before=2022-03-01",
        [
            application1.application_number,
            application2.application_number,
            application3.application_number,
        ],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_after=2022-01-02&handled_at_before=2022-02-28",
        [application2.application_number],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_after=2022-02-02&handled_at_before=2022-02-28",
        [],
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_after=2022-02-01",
        [application2.application_number, application3.application_number],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_before=2022-02-28",
        [application1.application_number, application2.application_number],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_after=2022-02-01&status=rejected",
        [application3.application_number],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?handled_at_after=2022-02-01&status=handling",
        [],
    )


def test_sensitive_data_removed_csv_output(sanitized_csv_service_with_one_application):
    csv_lines = split_lines_at_semicolon(
        sanitized_csv_service_with_one_application.get_csv_string()
    )

    sensitive_col_headings = [
        "Työntekijän etunimi",
        "Työntekijän sukunimi",
        "Työntekijän puhelinnumero",
        "Työntekijän sähköposti",
    ]

    for col_heading in sensitive_col_headings:
        assert col_heading not in csv_lines[0]


def test_power_bi_report_csv_output(application_powerbi_csv_service):
    csv_lines = split_lines_at_semicolon(
        application_powerbi_csv_service.get_csv_string()
    )

    expected_headers = [
        '\ufeff"Hakemusnumero"',  # Ensure BOM (Byte Order Mark) is correctly handled
        '"Työnantajan tyyppi"',
        '"Työnantajan Y-tunnus"',
        '"Helsinki-lisän määrä lopullinen"',
        '"Päätöspäivä"',
        '"Hakemuksen tila"',
        '"Hakemuksen tyyppi"',
        '"Hakemus saapunut"',
        '"Haettava lisä"',
        '"Haettu alkupäivä"',
        '"Haettu päättymispäivä"',
        '"Työnantajan yhtiömuoto"',
        '"Työnantajan yhtiömuoto (YTJ-numero)"',
        '"Yhdistys jolla taloudellista toimintaa?"',
        '"Hakijan kieli"',
        '"Palkkatuki myönnetty?"',
        '"Palkkatukiprosentti"',
        '"Oppisopimus?"',
        '"Työntekijän kuukausipalkka (hakijalta)"',
        '"Työntekijän lomaraha (hakijalta)"',
        '"Työntekijän muut kulut (hakijalta)"',
        '"Työntekijän työtunnit"',
        '"Työntekijän syntymäpäivä"',
        '"Helsinki-lisän määrä lopullinen"',
        '"Laskelman alkupäivä"',
        '"Laskelman päättymispäivä"',
        '"Käsittelypäivä"',
        '"Valtiotukimaksimi"',
        '"Laskelman lopputulos"',
        '"Myönnetään de minimis -tukena?"',
        '"Päätöspäivä"',
        '"Talpaan viennin päivä"',
        '"Takaisinlaskutettu"',
    ]

    # Assert that each column header matches
    for index, header in enumerate(expected_headers):
        assert csv_lines[0][index] == header, (
            f"Expected {header} but got {csv_lines[0][index]}"
        )

    applications = application_powerbi_csv_service.get_applications()

    assert int(csv_lines[1][0]) == applications[0].application_number

    for i, application in enumerate(applications):
        # Index 1 corresponds to the first row of values (i.e., skipping the header row)
        csv_row = csv_lines[i + 1]  # CSV rows start at 1 (skip header)

        assert int(csv_row[0]) == application.application_number
        assert csv_row[1] == '"Yritys"'
        assert csv_row[2] == f'"{application.company.business_id}"'
        assert csv_row[3] == str((application.calculation.calculated_benefit_amount))
        assert csv_row[4] == f'"{format_datetime(application.batch.decision_date)}"'
        assert csv_row[5] == f'"{application.status}"'

        assert (
            csv_row[6]
            == f'"{get_application_origin_label(application.application_origin)}"'
        )
        assert csv_row[7] == f'"{format_datetime(application.submitted_at)}"'
        assert csv_row[8] == '"Työllistämisen Helsinki-lisä"'
        assert csv_row[9] == f'"{str(application.start_date)}"'
        assert csv_row[10] == f'"{str(application.end_date)}"'

        assert csv_row[11] == f'"{application.company_form}"'
        assert csv_row[12] == str(application.company_form_code)
        assert (
            csv_row[13]
            == f'"{format_bool(application.association_has_business_activities)}"'
        )
        assert csv_row[14] == f'"{application.applicant_language}"'
        assert csv_row[15] == f'"{str(application.pay_subsidy_granted)}"'
        assert csv_row[16] == str(application.pay_subsidy_percent)
        assert csv_row[17] == f'"{format_bool(application.apprenticeship_program)}"'
        assert csv_row[18] == str(application.employee.monthly_pay)
        assert csv_row[19] == str(application.employee.vacation_money)
        assert csv_row[20] == str(application.employee.other_expenses)
        assert csv_row[21] == str(application.employee.working_hours)
        assert csv_row[22] == f'"{str(application.employee.birthday)}"'
        assert csv_row[23] == str((application.calculation.calculated_benefit_amount))
        assert csv_row[24] == f'"{str(application.calculation.start_date)}"'
        assert csv_row[25] == f'"{str(application.calculation.end_date)}"'
        assert csv_row[26] == f'"{format_datetime(application.handled_at)}"'
        assert csv_row[27] == str(application.calculation.state_aid_max_percentage)
        assert csv_row[28] == str((application.calculation.calculated_benefit_amount))
        assert (
            csv_row[29]
            == f'"{format_bool(application.calculation.granted_as_de_minimis_aid)}"'
        )
        assert csv_row[30] == f'"{format_datetime(application.batch.decision_date)}"'
        assert (
            csv_row[31]
            == f'"{str(application_powerbi_csv_service.get_completed_in_talpa_date(application))}"'
        )
        assert csv_row[32] == str(
            application_powerbi_csv_service.get_alteration_amount(application)
        )


def test_application_alteration_csv_output(
    application_alteration_csv_service, settings
):
    csv_lines = split_lines_at_semicolon(
        application_alteration_csv_service.get_csv_string()
    )

    settings.DEFAULT_SYSTEM_EMAIL = "helsinkilisa@hel.fi"

    alteration_1 = application_alteration_csv_service.get_alterations()[0]
    alteration_2 = application_alteration_csv_service.get_alterations()[1]

    assert csv_lines[0][0] == '\ufeff"Viitetiedot"'
    assert csv_lines[0][1] == '"Aikajakso, jolta tukea peritään takaisin"'
    assert csv_lines[0][2] == '"Summatieto"'

    assert csv_lines[0][3] == '"Laskutettavan virallinen nimi"'
    assert csv_lines[0][4] == '"Laskutusosoite"'
    assert csv_lines[0][5] == '"Y-tunnus"'

    assert csv_lines[0][6] == '"Laskutettavan yhteyshenkilö"'
    assert csv_lines[0][7] == '"Verkkolaskuosoite/OVT-tunnus"'
    assert csv_lines[0][8] == '"Operaattori-/välittäjätunnus"'

    assert csv_lines[0][9] == '"Tilitunniste"'
    assert csv_lines[0][10] == '"Lisätietoja antaa"'
    assert csv_lines[0][11] == '"Otsikko"'

    assert csv_lines[0][12] == '"Laskuttava yksikkö"'

    assert int(csv_lines[1][0]) == alteration_1.application.application_number
    assert (
        csv_lines[1][1]
        == f'"{application_alteration_csv_service.get_recovery_period(alteration_1)}"'
    )
    assert Decimal(csv_lines[1][2]) == alteration_1.recovery_amount

    assert csv_lines[1][3] == f'"{alteration_1.application.company.name}"'
    assert (
        csv_lines[1][4]
        == f'"{application_alteration_csv_service.get_company_address(alteration_1)}"'
    )
    assert csv_lines[1][5] == f'"{alteration_1.application.company.business_id}"'

    assert (
        csv_lines[1][6]
        == f'"{application_alteration_csv_service.get_company_contact_person(alteration_1)}"'
    )
    assert csv_lines[1][7] == f'"{alteration_1.einvoice_address}"'
    assert csv_lines[1][8] == f'"{alteration_1.einvoice_provider_identifier}"'

    assert (
        csv_lines[1][9]
        == f'"{application_alteration_csv_service.get_account_number(alteration_1)}"'
    )

    handler_string = (
        f'"{application_alteration_csv_service.get_handler_name(alteration_1)}"'
    )
    assert csv_lines[1][10] == handler_string

    assert settings.DEFAULT_SYSTEM_EMAIL in handler_string
    assert (
        csv_lines[1][11]
        == f'"{application_alteration_csv_service.get_title(alteration_1)}"'
    )

    assert (
        csv_lines[1][12]
        == f'"{application_alteration_csv_service.get_billing_department(alteration_1)}"'
    )

    assert int(csv_lines[2][0]) == alteration_2.application.application_number
    assert (
        csv_lines[2][1]
        == f'"{application_alteration_csv_service.get_recovery_period(alteration_2)}"'
    )
    assert Decimal(csv_lines[2][2]) == alteration_2.recovery_amount

    assert csv_lines[2][3] == f'"{alteration_2.application.company.name}"'
    assert (
        csv_lines[2][4]
        == f'"{application_alteration_csv_service.get_company_address(alteration_2)}"'
    )
    assert csv_lines[2][5] == f'"{alteration_2.application.company.business_id}"'

    assert (
        csv_lines[2][6]
        == f'"{application_alteration_csv_service.get_company_contact_person(alteration_2)}"'
    )
    assert csv_lines[2][7] == f'"{alteration_2.einvoice_address}"'
    assert csv_lines[2][8] == f'"{alteration_2.einvoice_provider_identifier}"'

    assert (
        csv_lines[2][9]
        == f'"{application_alteration_csv_service.get_account_number(alteration_2)}"'
    )
    assert (
        csv_lines[2][10]
        == f'"{application_alteration_csv_service.get_handler_name(alteration_2)}"'
    )
    assert (
        csv_lines[2][11]
        == f'"{application_alteration_csv_service.get_title(alteration_2)}"'
    )

    assert (
        csv_lines[2][12]
        == f'"{application_alteration_csv_service.get_billing_department(alteration_2)}"'
    )


def test_write_application_alterations_csv_file(
    application_alteration_csv_service, tmp_path
):
    alteration = application_alteration_csv_service.get_alterations()[0]
    output_file = tmp_path / "output.csv"
    application_alteration_csv_service.write_csv_file(output_file)
    with open(output_file, encoding="utf-8") as f:
        contents = f.read()
        print(contents)  # noqa: T201
        assert str(alteration.recovery_amount) in contents


@pytest.mark.parametrize(
    "instalments_enabled",
    [
        (False,),
        (True,),
    ],
)
def test_talpa_applications_csv_output(
    talpa_applications_csv_service_with_one_application, instalments_enabled, settings
):
    settings.PAYMENT_INSTALMENTS_ENABLED = instalments_enabled

    instalment_amount = decimal.Decimal("123.45")
    application = (
        talpa_applications_csv_service_with_one_application.get_applications()[0]
    )
    if instalments_enabled:
        application.calculation.instalments.all().delete()
        Instalment.objects.create(
            calculation=application.calculation,
            amount=instalment_amount,
            amount_paid=instalment_amount,
            instalment_number=1,
            status=InstalmentStatus.ACCEPTED,
            due_date=datetime.now(timezone.utc).date(),
        )

    csv_lines = split_lines_at_semicolon(
        talpa_applications_csv_service_with_one_application.get_csv_string()
    )
    # Assert that there are 18 column headers in the pruned CSV
    assert len(csv_lines[0]) == 18

    assert csv_lines[0][0] == '\ufeff"Hakemusnumero"'
    assert csv_lines[0][1] == '"Työnantajan tyyppi"'
    assert csv_lines[0][2] == '"Työnantajan tilinumero"'
    assert csv_lines[0][3] == '"Työnantajan nimi"'
    assert csv_lines[0][4] == '"Työnantajan Y-tunnus"'
    assert csv_lines[0][5] == '"Työnantajan katuosoite"'
    assert csv_lines[0][6] == '"Työnantajan postinumero"'
    assert csv_lines[0][7] == '"Työnantajan postitoimipaikka"'
    assert csv_lines[0][8] == '"Helsinki-lisän määrä lopullinen"'
    assert csv_lines[0][9] == '"Päättäjän nimike"'
    assert csv_lines[0][10] == '"Päättäjän nimi"'
    assert csv_lines[0][11] == '"Päätöspykälä"'
    assert csv_lines[0][12] == '"Päätöspäivä"'
    assert csv_lines[0][13] == '"Asiantarkastajan nimi Ahjo"'
    assert csv_lines[0][14] == '"Asiantarkastajan titteli Ahjo"'
    assert csv_lines[0][15] == '"Tarkastajan nimi, P2P"'
    assert csv_lines[0][16] == '"Tarkastajan sähköposti, P2P"'
    assert csv_lines[0][17] == '"Hyväksyjän nimi P2P"'

    # Assert that there are 19 columns in the pruned CSV
    assert len(csv_lines[1]) == 18

    assert int(csv_lines[1][0]) == application.application_number
    assert csv_lines[1][1] == '"Yritys"'
    assert csv_lines[1][2] == f'"{application.company_bank_account_number}"'
    assert csv_lines[1][3] == f'"{application.company_name}"'
    assert csv_lines[1][4] == f'"{application.company.business_id}"'
    assert csv_lines[1][5] == f'"{application.effective_company_street_address}"'
    assert csv_lines[1][6] == f'"{application.effective_company_postcode}"'
    assert csv_lines[1][7] == f'"{application.effective_company_city}"'
    if instalments_enabled:
        assert str(csv_lines[1][8]) == str(instalment_amount)
    else:
        assert str(csv_lines[1][8]) == str(
            application.calculation.calculated_benefit_amount
        )

    assert csv_lines[1][9] == f'"{application.batch.decision_maker_title}"'
    assert csv_lines[1][10] == f'"{application.batch.decision_maker_name}"'
    assert csv_lines[1][11] == f'"{application.batch.section_of_the_law}"'
    assert csv_lines[1][12] == f'"{application.batch.decision_date}"'
    assert csv_lines[1][13] == f'"{application.batch.expert_inspector_name}"'
    assert csv_lines[1][14] == f'"{application.batch.expert_inspector_title}"'
    assert csv_lines[1][15] == f'"{application.batch.p2p_inspector_name}"'
    assert csv_lines[1][16] == f'"{application.batch.p2p_inspector_email}"'
    assert csv_lines[1][17] == f'"{application.batch.p2p_checker_name}"'


def test_applications_csv_output(applications_csv_service):  # noqa: C901
    csv_lines = split_lines_at_semicolon(applications_csv_service.get_csv_string())
    assert csv_lines[0][0] == '\ufeff"Hakemusnumero"'
    assert (
        int(csv_lines[1][0])
        == applications_csv_service.get_applications()[0].application_number
    )
    application1 = applications_csv_service.get_applications()[0]
    application2 = applications_csv_service.get_applications()[1]

    for application in [application1, application2]:
        assert len(application.ahjo_rows) == 1
        assert application.ahjo_rows[0].start_date == application.calculation.start_date
        assert application.ahjo_rows[0].end_date == application.calculation.end_date

    csv_columns = iter(applications_csv_service.CSV_COLUMNS)
    next(csv_columns, None)  # Skip the first element

    for idx, col in enumerate(csv_columns, start=1):
        assert csv_lines[0][idx] == f'"{col.heading}"'

        if "Työnantajan tyyppi" in col.heading:
            assert csv_lines[1][idx] == '"Yritys"'
        elif "Haettava lisä" in col.heading:
            assert csv_lines[1][idx] == '"Työllistämisen Helsinki-lisä"'
        elif "Siirrettävä Ahjo-rivi / teksti" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.calculation.ahjo_rows[0].description_fi}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.calculation.ahjo_rows[0].description_fi}"'
            )
        elif "Siirrettävä Ahjo-rivi / alkupäivä" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.calculation.ahjo_rows[0].start_date.strftime("%Y-%m-%d")}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.calculation.ahjo_rows[0].start_date.strftime("%Y-%m-%d")}"'
            )
        elif "Siirrettävä Ahjo-rivi / päättymispäivä" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.calculation.ahjo_rows[0].end_date.strftime("%Y-%m-%d")}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.calculation.ahjo_rows[0].end_date.strftime("%Y-%m-%d")}"'
            )
        elif "Käsittelypäivä" in col.heading:
            assert (
                csv_lines[1][idx] == f'"{application1.handled_at.strftime("%Y-%m-%d")}"'
            )
        elif "Siirrettävä Ahjo-rivi / määrä eur kk" in col.heading:
            assert (
                Decimal(csv_lines[1][idx])
                == application1.calculation.ahjo_rows[0].monthly_amount
            )
            assert (
                Decimal(csv_lines[2][idx])
                == application2.calculation.ahjo_rows[0].monthly_amount
            )
        elif "Palkkatuki 1 / alkupäivä" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.pay_subsidies.all()[0].start_date.strftime("%Y-%m-%d")}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.pay_subsidies.all()[0].start_date.strftime("%Y-%m-%d")}"'
            )
        elif "De minimis 1 / myöntäjä" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.de_minimis_aid_set.all()[0].granter}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.de_minimis_aid_set.all()[0].granter}"'
            )
        elif "De minimis 2 / myönnetty" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.de_minimis_aid_set.all()[1].granted_at.strftime("%Y-%m-%d")}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.de_minimis_aid_set.all()[1].granted_at.strftime("%Y-%m-%d")}"'
            )
        elif "Laskelman lopputulos" in col.heading:
            assert (
                Decimal(csv_lines[1][idx])
                == application1.calculation.calculated_benefit_amount
            )
            assert (
                Decimal(csv_lines[2][idx])
                == application2.calculation.calculated_benefit_amount
            )


def test_applications_csv_cell_list_lines_generator(applications_csv_service):
    check_csv_cell_list_lines_generator(
        applications_csv_service, expected_row_count_with_header=3
    )


def test_applications_csv_string_lines_generator(applications_csv_service):
    check_csv_string_lines_generator(
        applications_csv_service, expected_row_count_with_header=3
    )


def test_applications_csv_two_ahjo_rows(
    applications_csv_service_with_one_application, tmp_path
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.pay_subsidies.all().delete()
    application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    # force two rows
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.status = (
        ApplicationStatus.HANDLING
    )  # so that recalculation can take place
    application.save()
    subsidy1 = PaySubsidyFactory(
        application=application,
        start_date=application.calculation.start_date,
        end_date=application.calculation.start_date + relativedelta(days=14),
        pay_subsidy_percent=40,
    )
    PaySubsidyFactory(
        application=application,
        start_date=subsidy1.end_date + relativedelta(days=1),
        end_date=application.calculation.end_date,
        pay_subsidy_percent=50,
    )
    application.refresh_from_db()
    application.calculation.calculate()
    application.status = ApplicationStatus.ACCEPTED
    application.save()
    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    assert len(application.ahjo_rows) == 2
    assert csv_lines[0][0] == '\ufeff"Hakemusnumero"'
    assert int(csv_lines[1][0]) == application.application_number
    assert csv_lines[1][1] == f'"{format_datetime(application.submitted_at)}"'
    assert int(csv_lines[1][2]) == 1
    assert int(csv_lines[2][0]) == application.application_number
    assert csv_lines[2][1] == f'"{format_datetime(application.submitted_at)}"'
    assert int(csv_lines[2][2]) == 2

    # the content of columns "Siirrettävä Ahjo-rivi / xxx" and "Hakemusrivi" change,
    # rest of the lines are equal
    current_ahjo_row_start = csv_lines[0].index('"Siirrettävä Ahjo-rivi / tyyppi"')
    current_ahjo_row_end = csv_lines[0].index(
        '"Siirrettävä Ahjo-rivi / päättymispäivä"'
    )
    assert (
        csv_lines[1][3:current_ahjo_row_start] == csv_lines[2][3:current_ahjo_row_start]
    )
    assert (
        csv_lines[1][current_ahjo_row_end + 1 :]
        == csv_lines[2][current_ahjo_row_end + 1 :]
    )
    assert len(csv_lines) == 3

    # Validate the content of "Siirrettävä Ahjo-rivi" for the 1st ahjo row
    assert (
        csv_lines[1][current_ahjo_row_start] == f'"{application.ahjo_rows[0].row_type}"'
    )
    assert (
        csv_lines[1][current_ahjo_row_start + 1]
        == f'"{application.ahjo_rows[0].description_fi}"'
    )
    assert (
        Decimal(csv_lines[1][current_ahjo_row_start + 2])
        == application.ahjo_rows[0].amount
    )
    assert (
        Decimal(csv_lines[1][current_ahjo_row_start + 3])
        == application.ahjo_rows[0].monthly_amount
    )
    assert (
        csv_lines[1][current_ahjo_row_start + 4]
        == f'"{application.ahjo_rows[0].start_date.isoformat()}"'
    )
    assert (
        csv_lines[1][current_ahjo_row_start + 5]
        == f'"{application.ahjo_rows[0].end_date.isoformat()}"'
    )

    # Validate the content of "Siirrettävä Ahjo-rivi" for the 2nd ahjo row
    assert (
        csv_lines[2][current_ahjo_row_start] == f'"{application.ahjo_rows[1].row_type}"'
    )
    assert (
        csv_lines[2][current_ahjo_row_start + 1]
        == f'"{application.ahjo_rows[1].description_fi}"'
    )
    assert (
        Decimal(csv_lines[2][current_ahjo_row_start + 2])
        == application.ahjo_rows[1].amount
    )
    assert (
        Decimal(csv_lines[2][current_ahjo_row_start + 3])
        == application.ahjo_rows[1].monthly_amount
    )
    assert (
        csv_lines[2][current_ahjo_row_start + 4]
        == f'"{application.ahjo_rows[1].start_date.isoformat()}"'
    )
    assert (
        csv_lines[2][current_ahjo_row_start + 5]
        == f'"{application.ahjo_rows[1].end_date.isoformat()}"'
    )

    column_1 = csv_lines[0].index('"Ahjo-rivi 1 / tyyppi"')
    column_2 = csv_lines[0].index('"Ahjo-rivi 2 / tyyppi"')
    for ahjo_row, start_column in zip(application.ahjo_rows, [column_1, column_2]):
        assert csv_lines[1][start_column] == f'"{ahjo_row.row_type}"'
        assert csv_lines[1][start_column + 1] == f'"{ahjo_row.description_fi}"'
        assert Decimal(csv_lines[1][start_column + 2]) == ahjo_row.amount
        assert Decimal(csv_lines[1][start_column + 3]) == ahjo_row.monthly_amount
        assert csv_lines[1][start_column + 4] == f'"{ahjo_row.start_date.isoformat()}"'
        assert csv_lines[1][start_column + 5] == f'"{ahjo_row.end_date.isoformat()}"'

    applications_csv_service_with_one_application.write_csv_file(
        tmp_path / "two_ahjo_rows.csv"
    )


def test_applications_csv_too_many_de_minimis_aids(
    applications_csv_service_with_one_application,
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    for _ in range(6):
        DeMinimisAidFactory(application=application)
    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    assert csv_lines[1][-1] == '"osa de minimis -tuista puuttuu raportilta"'


def test_applications_csv_too_many_pay_subsidies(
    applications_csv_service_with_one_application,
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    application.pay_subsidies.all().delete()
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.status = (
        ApplicationStatus.HANDLING
    )  # so that recalculation can take place
    application.save()
    # force three rows (should not happen in real usage)
    subsidy1 = PaySubsidyFactory(
        application=application,
        start_date=application.calculation.start_date,
        end_date=application.calculation.start_date + relativedelta(days=14),
        pay_subsidy_percent=40,
    )
    subsidy2 = PaySubsidyFactory(
        application=application,
        start_date=subsidy1.end_date + relativedelta(days=1),
        end_date=subsidy1.end_date + relativedelta(days=7),
        pay_subsidy_percent=50,
    )
    PaySubsidyFactory(
        application=application,
        start_date=subsidy2.end_date + relativedelta(days=1),
        end_date=application.calculation.end_date,
        pay_subsidy_percent=40,
    )
    application.refresh_from_db()
    application.calculation.calculate()
    assert len(application.ahjo_rows) == 3

    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    assert (
        csv_lines[1][-1]
        == '"osa palkkatuista puuttuu raportilta, osa Ahjo-riveistä puuttuu raportilta"'
    )


def test_applications_csv_non_ascii_characters(
    applications_csv_service_with_one_application,
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.company_name = "test äöÄÖtest"
    application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    application.save()
    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    assert csv_lines[1][12] == '"test äöÄÖtest"'  # string is quoted


def test_applications_csv_delimiter(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.company_name = "test;12"
    application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    application.save()
    assert (
        ';"test;12";' in applications_csv_service_with_one_application.get_csv_string()
    )


def test_applications_csv_missing_data(applications_csv_with_no_applications):
    csv_lines = split_lines_at_semicolon(
        applications_csv_with_no_applications.get_csv_string()
    )
    assert len(csv_lines) == 2
    assert len(csv_lines[0]) == len(csv_lines[1])
    assert csv_lines[1][0] == '"Ei löytynyt ehdot täyttäviä hakemuksia"'


def test_applications_csv_monthly_amount_override(
    applications_csv_service_with_one_application,
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.status = ApplicationStatus.HANDLING
    application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    application.save()
    application.calculation.override_monthly_benefit_amount = 100
    application.calculation.save()
    application.calculation.start_date = date(2021, 1, 1)
    application.calculation.end_date = date(2021, 2, 28)
    application.calculation.calculate()
    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    monthly_col = csv_lines[0].index('"Ahjo-rivi 1 / määrä eur kk"')
    total_col = csv_lines[0].index('"Ahjo-rivi 1 / määrä eur yht"')
    assert csv_lines[1][monthly_col] == "100.00"
    assert csv_lines[1][total_col] == "200.00"

    current_monthly_col = csv_lines[0].index('"Siirrettävä Ahjo-rivi / määrä eur kk"')
    current_total_col = csv_lines[0].index('"Siirrettävä Ahjo-rivi / määrä eur yht"')
    assert csv_lines[1][current_monthly_col] == "100.00"
    assert csv_lines[1][current_total_col] == "200.00"


def test_write_applications_csv_file(applications_csv_service, tmp_path):
    application = applications_csv_service.get_applications()[0]
    application.company_name = "test äöÄÖtest"
    application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    application.save()
    output_file = tmp_path / "output.csv"
    applications_csv_service.write_csv_file(output_file)
    with open(output_file, encoding="utf-8") as f:
        contents = f.read()
        assert "äöÄÖtest" in contents


def test_applications_csv_pdf_zip_export_new_applications(handler_api_client):
    # create 1 rejected, 2 accepted and 1 application in handling
    _create_applications_for_export()

    rejected_archive = _get_csv_pdf_zip(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_new_rejected_applications_csv_pdf/",
    )
    # 1 rejected PDF + 2 composed PDFs + 1 CSV == 4
    assert len(rejected_archive.infolist()) == 4
    extension_to_filenames = get_filenames_grouped_by_extension_from_zip(
        rejected_archive
    )
    assert len(extension_to_filenames.get(".csv", [])) == 1
    assert len(extension_to_filenames.get(".pdf", [])) == 3

    # re-running the request results in an empty response and doesn't create new batches
    rejected_archive = _get_csv_pdf_zip(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_new_rejected_applications_csv_pdf/",
    )
    assert len(rejected_archive.infolist()) == 1  # Only csv for signifying empty
    extension_to_filenames: dict = get_filenames_grouped_by_extension_from_zip(
        rejected_archive
    )
    assert len(extension_to_filenames.get(".csv", [])) == 1

    # accepted applications
    accepted_archive = _get_csv_pdf_zip(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_new_accepted_applications_csv_pdf/",
    )

    # 2 accepted PDFs + 2 composed PDFs + 1 CSV == 5
    assert len(accepted_archive.infolist()) == 5
    extension_to_filenames: dict = get_filenames_grouped_by_extension_from_zip(
        accepted_archive
    )
    assert len(extension_to_filenames.get(".csv", [])) == 1
    assert len(extension_to_filenames.get(".pdf", [])) == 4

    # re-running the request results in an empty response and doesn't create new batches
    accepted_archive = _get_csv_pdf_zip(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_new_accepted_applications_csv_pdf/",
    )
    assert len(accepted_archive.infolist()) == 1  # Only csv for signifying empty
    extension_to_filenames: dict = get_filenames_grouped_by_extension_from_zip(
        accepted_archive
    )
    assert len(extension_to_filenames.get(".csv", [])) == 1
    assert len(extension_to_filenames.get(".pdf", [])) == 0
