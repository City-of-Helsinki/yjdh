import io
import zipfile
from datetime import date
from typing import List
from unittest.mock import patch

import pytest

from applications.enums import ApplicationStatus, BenefitType
from applications.models import Application
from applications.services.ahjo_integration import (
    ACCEPTED_TITLE,
    export_application_batch,
    ExportFileInfo,
    generate_composed_files,
    generate_single_approved_file,
    generate_single_declined_file,
    REJECTED_TITLE,
)
from applications.tests.factories import ApplicationFactory, DecidedApplicationFactory
from calculator.models import Calculation
from calculator.tests.factories import PaySubsidyFactory
from companies.tests.factories import CompanyFactory
from helsinkibenefit.tests.conftest import *  # noqa
from shared.service_bus.enums import YtjOrganizationCode

DE_MINIMIS_AID_PARTIAL_TEXT = (
    # In English ~= "support is granted as insignificant i.e. de minimis support"
    "tuki myönnetään vähämerkityksisenä eli ns. de minimis -tukena"
)


def normalize_whitespace(text: str) -> str:
    return " ".join(text.split())


def _assert_html_content(html, include_keys=(), excluded_keys=()):
    for k in include_keys:
        assert k in html
    for k in excluded_keys:
        assert k not in html


@pytest.mark.parametrize(
    "company_form_code,company_form,de_minimis_aids,should_show_de_minimis_aid_footer",
    [
        (
            YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT,
            "ry",
            [False, False, False],
            False,
        ),
        (
            YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT,
            "oy",
            [False, False, False],
            False,
        ),
        (
            YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT,
            "oy",
            [False, True, False],
            True,
        ),
        (YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT, "oy", [True, True, True], True),
    ],
)
@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_single_approved_template_html(
    mock_pdf_convert,
    company_form_code: YtjOrganizationCode,
    company_form: str,
    de_minimis_aids: List[bool],
    should_show_de_minimis_aid_footer: bool,
):
    mock_pdf_convert.return_value = {}
    company = CompanyFactory(
        company_form_code=company_form_code, company_form=company_form
    )
    apps: List[Application] = [
        DecidedApplicationFactory(
            company=company,
            de_minimis_aid=de_minimis_aid,
            status=ApplicationStatus.ACCEPTED,
        )
        for de_minimis_aid in de_minimis_aids
    ]
    for app in apps:
        app.calculation.calculated_benefit_amount = 1000
        app.calculation.save()
    # Only assert html content for easier comparison
    html = generate_single_approved_file(apps[0].company, apps).html_content
    for app in apps:
        _assert_html_content(
            html,
            (
                app.ahjo_application_number,
                app.employee.first_name,
                app.employee.last_name,
            ),
        )
    whitespace_normalized_html = normalize_whitespace(html)
    assert (
        normalize_whitespace(ACCEPTED_TITLE).casefold()
        in whitespace_normalized_html.casefold()
    )
    assert (
        DE_MINIMIS_AID_PARTIAL_TEXT.casefold() in whitespace_normalized_html.casefold()
    ) == should_show_de_minimis_aid_footer


@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_single_declined_template_html(mock_pdf_convert):
    mock_pdf_convert.return_value = {}
    company = CompanyFactory()
    apps = ApplicationFactory.create_batch(
        3, company=company, status=ApplicationStatus.REJECTED
    )
    # Only assert html content for easier comparison
    html = generate_single_declined_file(apps[0].company, apps).html_content
    for app in apps:
        _assert_html_content(
            html,
            (
                app.ahjo_application_number,
                app.employee.first_name,
                app.employee.last_name,
            ),
        )

    whitespace_normalized_html = normalize_whitespace(html)
    assert (
        normalize_whitespace(REJECTED_TITLE).casefold()
        in whitespace_normalized_html.casefold()
    )
    assert (
        DE_MINIMIS_AID_PARTIAL_TEXT.casefold()
        not in whitespace_normalized_html.casefold()
    )


@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_composed_template_html(mock_pdf_convert):
    mock_pdf_convert.return_value = {}
    accepted_app_1 = DecidedApplicationFactory(
        status=ApplicationStatus.ACCEPTED,
        start_date=date.today(),
    )
    accepted_app_1.calculation.calculated_benefit_amount = 1000
    accepted_app_1.calculation.save()
    accepted_app_2 = DecidedApplicationFactory(
        status=ApplicationStatus.ACCEPTED,
        start_date=date.today(),
    )
    accepted_app_2.calculation.calculated_benefit_amount = 1000
    accepted_app_2.calculation.save()
    rejected_app_1 = DecidedApplicationFactory(
        status=ApplicationStatus.REJECTED, start_date=date.today()
    )
    rejected_app_2 = DecidedApplicationFactory(
        status=ApplicationStatus.REJECTED, start_date=date.today()
    )

    # Only assert html content for easier comparison
    files: List[ExportFileInfo] = generate_composed_files(
        [accepted_app_1, accepted_app_2], [rejected_app_1, rejected_app_2]
    )
    assert len(files) == 4

    # files[0]: Public accepted composed files
    # files[1]: Private accepted composed files
    # files[2]: Private rejected composed files
    _assert_html_content(
        files[0].html_content,
        (
            accepted_app_1.ahjo_application_number,
            accepted_app_2.ahjo_application_number,
        ),
        (
            rejected_app_1.ahjo_application_number,
            rejected_app_2.ahjo_application_number,
            accepted_app_1.employee.first_name,
            accepted_app_2.employee.first_name,
        ),
    )
    _assert_html_content(
        files[1].html_content,
        (
            accepted_app_1.ahjo_application_number,
            accepted_app_2.ahjo_application_number,
        ),
        (rejected_app_1.ahjo_application_number,),
    )
    _assert_html_content(
        files[2].html_content,
        (
            rejected_app_1.ahjo_application_number,
            rejected_app_2.ahjo_application_number,
        ),
        (
            accepted_app_1.ahjo_application_number,
            accepted_app_2.ahjo_application_number,
        ),
    )


def test_export_application_batch(application_batch):
    application_batch.applications.add(
        DecidedApplicationFactory.create(
            status=ApplicationStatus.ACCEPTED,
            calculation__calculated_benefit_amount=1000,
        )
    )
    application_batch.applications.add(
        DecidedApplicationFactory.create(status=ApplicationStatus.REJECTED)
    )
    application_batch.applications.add(
        DecidedApplicationFactory.create(status=ApplicationStatus.CANCELLED)
    )
    zip_file = export_application_batch(application_batch)
    file_like_object = io.BytesIO(zip_file)
    archive = zipfile.ZipFile(file_like_object)
    assert (
        len(archive.infolist())
        == application_batch.applications.exclude(
            status=ApplicationStatus.CANCELLED
        ).count()
        + 4
    )


@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_multiple_benefit_per_application(mock_pdf_convert):
    mock_pdf_convert.return_value = {}
    # Test case data and expected results collected from
    # calculator/tests/Helsinki-lisa laskurin testitapaukset.xlsx/ Sheet Palkan Helsinki-lisä / Column E
    application = ApplicationFactory(
        association_has_business_activities=True,
        company__company_form="ry",
        company__company_form_code=YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT,
        start_date=date(2021, 7, 10),
        end_date=date(2021, 11, 10),
        status=ApplicationStatus.RECEIVED,
        benefit_type=BenefitType.SALARY_BENEFIT,
    )

    application.calculation = Calculation(
        application=application,
        monthly_pay=3200,
        vacation_money=0,
        other_expenses=200,
        start_date=application.start_date,
        end_date=application.end_date,
        state_aid_max_percentage=50,
        calculated_benefit_amount=0,
        override_monthly_benefit_amount=None,
    )
    pay_subsidy = PaySubsidyFactory(
        pay_subsidy_percent=40, start_date=date(2021, 7, 10), end_date=date(2021, 9, 10)
    )
    application.pay_subsidies.add(pay_subsidy)
    application.save()
    application.calculation.save()
    application.refresh_from_db()
    application.calculation.init_calculator()
    application.calculation.calculate()
    html = generate_single_approved_file(
        application.company, [application]
    ).html_content
    assert (
        html.count(application.ahjo_application_number) == 2
    )  # Make sure there are two rows in the report
    _assert_html_content(
        html,
        (
            application.ahjo_application_number,
            application.employee.first_name,
            application.employee.last_name,
            "691",
            "340",
            "1600",
            "800",
        ),
    )
