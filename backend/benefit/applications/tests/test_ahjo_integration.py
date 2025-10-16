import io
import os
import uuid
import zipfile
from datetime import date, timedelta
from typing import List, Union
from unittest.mock import patch

import pytest
from django.core.exceptions import ImproperlyConfigured, ObjectDoesNotExist
from django.http import FileResponse
from django.urls import reverse
from django.utils import timezone

from applications.api.v1.ahjo_integration_views import AhjoAttachmentView
from applications.enums import (
    DEFAULT_AHJO_CALLBACK_ERROR_MESSAGE,
    AhjoCallBackStatus,
    AhjoDecisionUpdateType,
    AhjoRequestType,
    ApplicationBatchStatus,
    ApplicationStatus,
    ApplicationTalpaStatus,
    AttachmentType,
    BenefitType,
)
from applications.enums import (
    AhjoStatus as AhjoStatusEnum,
)
from applications.models import (
    AhjoDecisionText,
    AhjoStatus,
    Application,
    ApplicationBatch,
    Attachment,
)
from applications.services.ahjo_application_service import (
    AhjoApplicationsService,
    AhjoQueryParameters,
)
from applications.services.ahjo_integration import (
    ACCEPTED_TITLE,
    REJECTED_TITLE,
    ExportFileInfo,
    export_application_batch,
    generate_application_attachment,
    generate_composed_files,
    generate_single_approved_file,
    generate_single_declined_file,
    get_application_for_ahjo,
)
from applications.tests.factories import ApplicationFactory, DecidedApplicationFactory
from calculator.models import Calculation
from calculator.tests.factories import PaySubsidyFactory
from common.utils import hash_file
from companies.tests.factories import CompanyFactory
from helsinkibenefit.tests.conftest import *  # noqa
from shared.common.tests.utils import normalize_whitespace
from shared.service_bus.enums import YtjOrganizationCode
from users.models import User

DE_MINIMIS_AID_PARTIAL_TEXT = (
    # In English ~= "support is granted as insignificant i.e. de minimis support"
    "tuki myönnetään vähämerkityksisenä eli ns. de minimis -tukena"
)


def _assert_html_content(html, include_keys=(), excluded_keys=()):
    for k in include_keys:
        assert k in html
    for k in excluded_keys:
        assert k not in html


@pytest.mark.parametrize(
    "company_form_code,company_form,should_show_de_minimis_aid_footer",
    [
        (
            YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT,
            "ry",
            False,
        ),
        (
            YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT,
            "oy",
            False,
        ),
        (
            YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT,
            "oy",
            True,
        ),
        (YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT, "oy", True),
    ],
)
@pytest.mark.django_db
@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_single_approved_template_html(
    mock_pdf_convert,
    company_form_code: YtjOrganizationCode,
    company_form: str,
    should_show_de_minimis_aid_footer: bool,
):
    mock_pdf_convert.return_value = {}
    company = CompanyFactory(
        company_form_code=company_form_code, company_form=company_form
    )
    apps: List[Application] = [
        DecidedApplicationFactory(
            company=company,
            status=ApplicationStatus.ACCEPTED,
        )
    ]
    for app in apps:
        app.calculation.calculated_benefit_amount = 1000
        app.calculation.granted_as_de_minimis_aid = should_show_de_minimis_aid_footer
        app.calculation.save()
    # Only assert html content for easier comparison
    html = generate_single_approved_file(apps[0].company, apps, 3).html_content
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


@pytest.mark.django_db
@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_single_declined_template_html(mock_pdf_convert):
    mock_pdf_convert.return_value = {}
    company = CompanyFactory()
    apps = ApplicationFactory.create_batch(
        3, company=company, status=ApplicationStatus.REJECTED
    )
    # Only assert html content for easier comparison
    html = generate_single_declined_file(apps[0].company, apps, 4).html_content
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


@pytest.mark.django_db
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
        [accepted_app_1, accepted_app_2], [rejected_app_1, rejected_app_2], 5
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


@pytest.mark.django_db
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


@pytest.mark.django_db
@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_multiple_benefit_per_application(mock_pdf_convert):
    mock_pdf_convert.return_value = {}
    # Test case data and expected results collected from
    # calculator/tests/Helsinki-lisa laskurin testitapaukset.xlsx/ Sheet Palkan
    # Helsinki-lisä / Column E
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
        pay_subsidy_percent=50, start_date=date(2021, 7, 10), end_date=date(2021, 9, 10)
    )
    application.pay_subsidies.add(pay_subsidy)
    application.save()
    application.calculation.save()
    application.refresh_from_db()
    application.calculation.init_calculator()
    application.calculation.calculate()
    html = generate_single_approved_file(
        application.company, [application], 6
    ).html_content
    assert (
        html.count(application.ahjo_application_number) == 2
    )  # Make sure there are two rows in the report
    print(html)  # noqa: T201
    _assert_html_content(
        html,
        (
            application.ahjo_application_number,
            application.employee.first_name,
            application.employee.last_name,
            "440",
            "893",
            "1600",
            "800",
            "2493",
        ),
    )


@pytest.mark.django_db
def test_prepare_ahjo_file_response(decided_application):
    attachment = decided_application.attachments.first()
    response = AhjoAttachmentView._prepare_file_response(attachment)

    assert isinstance(response, FileResponse)

    assert response["Content-Length"] == f"{attachment.attachment_file.size}"
    assert (
        response["Content-Disposition"]
        == f"attachment; filename={attachment.attachment_file.name}"
    )
    assert response["Content-Type"] == f"{attachment.content_type}"


@pytest.fixture
def attachment(decided_application):
    return decided_application.attachments.first()


@pytest.mark.django_db
def test_get_attachment_success(ahjo_client, attachment, ahjo_user_token, settings):
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    url = reverse("ahjo_attachment_url", kwargs={"uuid": attachment.id})

    auth_headers = {"HTTP_AUTHORIZATION": "Token " + ahjo_user_token.key}

    response = ahjo_client.get(url, **auth_headers)

    assert response.status_code == 200
    assert response["Content-Type"] == f"{attachment.content_type}"
    assert response["Content-Length"] == f"{attachment.attachment_file.size}"
    assert (
        response["Content-Disposition"]
        == f"attachment; filename={attachment.attachment_file.name}"
    )


@pytest.mark.django_db
def test_get_attachment_not_found(ahjo_client, ahjo_user_token, settings):
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    id = uuid.uuid4()
    url = reverse("ahjo_attachment_url", kwargs={"uuid": id})
    auth_headers = {"HTTP_AUTHORIZATION": "Token " + ahjo_user_token.key}

    response = ahjo_client.get(url, **auth_headers)

    assert response.status_code == 404


@pytest.mark.django_db
def test_get_attachment_unauthorized_wrong_or_missing_credentials(
    anonymous_client, attachment, settings
):
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    # without any auth headers
    url = reverse("ahjo_attachment_url", kwargs={"uuid": attachment.id})
    response = anonymous_client.get(url)

    assert response.status_code == 401
    # with incorrect auth token
    response = anonymous_client.get(
        url,
        headers={"Authorization": "Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"},
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_get_attachment_unauthorized_ip_not_allowed(
    ahjo_client, ahjo_user_token, attachment, settings
):
    settings.NEXT_PUBLIC_MOCK_FLAG = False
    url = reverse("ahjo_attachment_url", kwargs={"uuid": attachment.id})
    auth_headers = {"HTTP_AUTHORIZATION": "Token " + ahjo_user_token.key}

    response = ahjo_client.get(url, **auth_headers)
    assert response.status_code == 403


def _get_callback_url(
    request_type: AhjoRequestType, decided_application: Union[Application, None]
):
    kwargs_dict = {}
    route_name = "ahjo_decision_callback_url"

    if not request_type == AhjoRequestType.SUBSCRIBE_TO_DECISIONS:
        kwargs_dict["request_type"] = request_type
        kwargs_dict["uuid"] = str(decided_application.id)
        route_name = "ahjo_callback_url"

    return reverse(
        route_name,
        kwargs=kwargs_dict,
    )


@pytest.fixture
def ahjo_callback_payload():
    return {
        "message": "",
        "requestId": f"{uuid.uuid4()}",
        "caseId": "HEL 2023-999999",
        "caseGuid": f"{uuid.uuid4()}",
        "records": [
            {
                "fileURI": "https://example.com",
                "status": "Success",
                "hashValue": "",
                "versionSeriesId": f"{uuid.uuid4()}",
            }
        ],
    }


@pytest.mark.parametrize(
    "request_type, previous_ahjo_status, ahjo_status",
    [
        (
            AhjoRequestType.OPEN_CASE,
            AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT,
            AhjoStatusEnum.CASE_OPENED,
        ),
        (
            AhjoRequestType.UPDATE_APPLICATION,
            AhjoStatusEnum.UPDATE_REQUEST_SENT,
            AhjoStatusEnum.UPDATE_REQUEST_RECEIVED,
        ),
        (
            AhjoRequestType.DELETE_APPLICATION,
            AhjoStatusEnum.DELETE_REQUEST_SENT,
            AhjoStatusEnum.DELETE_REQUEST_RECEIVED,
        ),
        (
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
        ),
    ],
)
@pytest.mark.django_db
def test_ahjo_callback_success(
    ahjo_client,
    ahjo_user_token,
    decided_application,
    settings,
    request_type,
    previous_ahjo_status,
    ahjo_status,
    ahjo_callback_payload,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    auth_headers = {"HTTP_AUTHORIZATION": "Token " + ahjo_user_token.key}
    attachment = generate_application_attachment(
        decided_application, AttachmentType.PDF_SUMMARY
    )
    attachment_hash_value = hash_file(attachment.attachment_file)
    attachment.ahjo_hash_value = attachment_hash_value
    attachment.save()
    ahjo_callback_payload["message"] = AhjoCallBackStatus.SUCCESS
    ahjo_callback_payload["records"][0]["hashValue"] = attachment_hash_value

    status = AhjoStatus.objects.create(
        application=decided_application,
        status=previous_ahjo_status,
    )
    # make sure the previous status is created earlier than the new status
    status.created_at = timezone.now() - timedelta(days=5)
    status.save()

    if request_type in [
        AhjoRequestType.SEND_DECISION_PROPOSAL,
        AhjoRequestType.DELETE_APPLICATION,
    ]:
        batch = ApplicationBatch.objects.create(auto_generated_by_ahjo=True)
        decided_application.batch_id = batch.id
        decided_application.save()

    url = _get_callback_url(request_type, decided_application)
    response = ahjo_client.post(url, **auth_headers, data=ahjo_callback_payload)

    decided_application.refresh_from_db()
    attachment.refresh_from_db()
    assert response.status_code == 200
    assert response.data == {"message": "Callback received"}

    if request_type == AhjoRequestType.OPEN_CASE:
        assert decided_application.ahjo_case_id == ahjo_callback_payload["caseId"]
        assert (
            str(decided_application.ahjo_case_guid) == ahjo_callback_payload["caseGuid"]
        )
        assert (
            attachment.ahjo_version_series_id
            == ahjo_callback_payload["records"][0]["versionSeriesId"]
        )
        batch = decided_application.batch
        assert batch.auto_generated_by_ahjo
        assert batch.handler == decided_application.calculation.handler
        assert batch.status == ApplicationBatchStatus.DRAFT

    if request_type == AhjoRequestType.UPDATE_APPLICATION:
        assert (
            attachment.ahjo_version_series_id
            == ahjo_callback_payload["records"][0]["versionSeriesId"]
        )

    if request_type == AhjoRequestType.SEND_DECISION_PROPOSAL:
        batch = decided_application.batch

        assert batch.status == ApplicationBatchStatus.AWAITING_AHJO_DECISION

    if request_type == AhjoRequestType.DELETE_APPLICATION:
        decided_application.refresh_from_db()

        assert decided_application.status == ApplicationStatus.CANCELLED
        assert decided_application.batch.status == ApplicationBatchStatus.CANCELLED
        assert decided_application.archived is True

    assert decided_application.ahjo_status.latest().status == ahjo_status


@pytest.mark.parametrize(
    "updatetype_from_ahjo, status_after_callback",
    [
        (AhjoDecisionUpdateType.ADDED, AhjoStatusEnum.SIGNED_IN_AHJO),
        (AhjoDecisionUpdateType.REMOVED, AhjoStatusEnum.REMOVED_IN_AHJO),
    ],
)
@pytest.mark.django_db
def test_subscribe_to_decisions_callback_success(
    ahjo_client,
    ahjo_user_token,
    decided_application,
    status_after_callback,
    settings,
    updatetype_from_ahjo,
):
    dummy_case_id = "HEL 1999-123"
    decided_application.ahjo_case_id = dummy_case_id
    decided_application.handled_by_ahjo_automation = True
    decided_application.save()

    settings.NEXT_PUBLIC_MOCK_FLAG = True
    auth_headers = {"HTTP_AUTHORIZATION": "Token " + ahjo_user_token.key}

    callback_payload = {
        "updatetype": updatetype_from_ahjo,
        "id": f"{uuid.uuid4()}",
        "caseId": dummy_case_id,
        "caseGuid": f"{uuid.uuid4()}",
    }
    cb_url = _get_callback_url(AhjoRequestType.SUBSCRIBE_TO_DECISIONS, None)
    response = ahjo_client.post(cb_url, **auth_headers, data=callback_payload)

    assert response.status_code == 200
    assert response.data == {"message": "Callback received"}

    decided_application.refresh_from_db()
    assert decided_application.ahjo_status.latest().status == status_after_callback


@pytest.mark.parametrize(
    "request_type, last_ahjo_status, failure_details",
    [
        (
            AhjoRequestType.OPEN_CASE,
            AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT,
            [
                {
                    "id": "INVALID_RECORD_TYPE",
                    "message": "Asiakirjan tyyppi ei ole sallittu.",
                    "context": (
                        "(Tähän tulisi tietoa virheen esiintymispaikasta jos"
                        " mahdollista antaa.)"
                    ),
                }
            ],
        ),
        (
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            [
                {
                    "id": "INVALID_RECORD_TYPE",
                    "message": "Asiakirjan tyyppi ei ole sallittu.",
                    "context": (
                        "(Tähän tulisi tietoa virheen esiintymispaikasta jos"
                        " mahdollista antaa.)"
                    ),
                }
            ],
        ),
        (
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            None,
        ),
    ],
)
@pytest.mark.django_db
def test_ahjo_callback_failure(
    ahjo_client,
    ahjo_user_token,
    decided_application,
    settings,
    ahjo_callback_payload,
    request_type,
    last_ahjo_status,
    failure_details,
):
    ahjo_callback_payload.pop("caseId", None)
    ahjo_callback_payload.pop("caseGuid", None)
    ahjo_callback_payload["message"] = AhjoCallBackStatus.FAILURE

    AhjoStatus.objects.create(
        application=decided_application,
        status=last_ahjo_status,
    )

    if failure_details:
        ahjo_callback_payload["failureDetails"] = failure_details

    url = reverse(
        "ahjo_callback_url",
        kwargs={
            "request_type": request_type,
            "uuid": decided_application.id,
        },
    )
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    auth_headers = {"HTTP_AUTHORIZATION": "Token " + ahjo_user_token.key}
    response = ahjo_client.post(url, **auth_headers, data=ahjo_callback_payload)

    assert response.status_code == 200
    assert response.data == {
        "message": "Callback received but request was unsuccessful at AHJO"
    }

    decided_application.refresh_from_db()

    latest_status = decided_application.ahjo_status.latest()
    assert latest_status.status == last_ahjo_status
    if not failure_details:
        assert latest_status.error_from_ahjo == DEFAULT_AHJO_CALLBACK_ERROR_MESSAGE
    else:
        assert latest_status.error_from_ahjo == ahjo_callback_payload["failureDetails"]
        assert latest_status.ahjo_request_id == ahjo_callback_payload["requestId"]


@pytest.mark.parametrize(
    "request_type",
    [
        (AhjoRequestType.OPEN_CASE,),
        (AhjoRequestType.UPDATE_APPLICATION,),
        (AhjoRequestType.DELETE_APPLICATION,),
    ],
)
@pytest.mark.django_db
def test_ahjo_callback_unauthorized_wrong_or_missing_credentials(
    anonymous_client, decided_application, settings, request_type
):
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    url = reverse(
        "ahjo_callback_url",
        kwargs={"request_type": request_type, "uuid": decided_application.id},
    )
    response = anonymous_client.post(url)

    assert response.status_code == 401
    response = anonymous_client.post(
        url,
        headers={"Authorization": "Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"},
    )
    assert response.status_code == 401


@pytest.mark.parametrize(
    "request_type",
    [
        (AhjoRequestType.OPEN_CASE,),
        (AhjoRequestType.UPDATE_APPLICATION,),
        (AhjoRequestType.DELETE_APPLICATION,),
    ],
)
@pytest.mark.django_db
def test_ahjo_callback_unauthorized_ip_not_allowed(
    ahjo_client, ahjo_user_token, decided_application, settings, request_type
):
    settings.NEXT_PUBLIC_MOCK_FLAG = False
    url = reverse(
        "ahjo_callback_url",
        kwargs={"request_type": request_type, "uuid": decided_application.id},
    )
    auth_headers = {"HTTP_AUTHORIZATION": "Token " + ahjo_user_token.key}

    response = ahjo_client.post(url, **auth_headers)
    assert response.status_code == 403


@pytest.mark.django_db
def test_ahjo_callback_raises_error_without_batch(
    ahjo_callback_payload, decided_application, ahjo_client, ahjo_user_token, settings
):
    settings.NEXT_PUBLIC_MOCK_FLAG = True

    status = AhjoStatus.objects.create(
        application=decided_application,
        status=AhjoStatusEnum.CASE_OPENED,
    )
    status.created_at = timezone.now() - timedelta(days=5)
    status.save()

    auth_headers = {"HTTP_AUTHORIZATION": "Token " + ahjo_user_token.key}
    attachment = generate_application_attachment(
        decided_application, AttachmentType.PDF_SUMMARY
    )
    attachment_hash_value = hash_file(attachment.attachment_file)
    attachment.ahjo_hash_value = attachment_hash_value
    attachment.save()
    ahjo_callback_payload["message"] = AhjoCallBackStatus.SUCCESS
    ahjo_callback_payload["records"][0]["hashValue"] = attachment_hash_value

    url = _get_callback_url(AhjoRequestType.SEND_DECISION_PROPOSAL, decided_application)
    # with pytest.raises(AhjoCallbackError):
    response = ahjo_client.post(url, **auth_headers, data=ahjo_callback_payload)
    assert response.status_code == 500
    assert response.data == {
        "error": (
            f"Application {decided_application.id} has no batch when Ahjo has received"
            " a decision proposal request"
        )
    }


@pytest.mark.django_db
def test_get_application_for_ahjo_success(decided_application):
    user = decided_application.calculation.handler
    User.objects.filter(pk=user.id).update(ad_username="foobar")
    assert get_application_for_ahjo(decided_application.id) == decided_application


@pytest.mark.django_db
def test_get_application_for_ahjo_no_application():
    # Try to get an application with a non-existing id
    with pytest.raises(ObjectDoesNotExist):
        get_application_for_ahjo(uuid.uuid4())


@pytest.mark.django_db
def test_get_application_for_ahjo_no_ad_username(decided_application):
    # Try to get an application with a handler that has no ad_username
    with pytest.raises(ImproperlyConfigured):
        get_application_for_ahjo(decided_application.id)


@pytest.mark.django_db
def test_create_or_update_pdf_summary_as_attachment_(decided_application):
    attachment = generate_application_attachment(
        decided_application, AttachmentType.PDF_SUMMARY
    )
    assert isinstance(attachment, Attachment)

    assert attachment.application == decided_application
    assert attachment.content_type == "application/pdf"
    assert attachment.attachment_type == AttachmentType.PDF_SUMMARY
    assert (
        attachment.attachment_file.name
        == f"application_summary_{decided_application.application_number}.pdf"
    )
    assert attachment.attachment_file.size > 0
    assert os.path.exists(attachment.attachment_file.path)
    if os.path.exists(attachment.attachment_file.path):
        os.remove(attachment.attachment_file.path)

    attachment = generate_application_attachment(
        decided_application, AttachmentType.PDF_SUMMARY
    )

    summaries = Attachment.objects.filter(
        application=decided_application, attachment_type=AttachmentType.PDF_SUMMARY
    )
    assert summaries.count() == 1


@pytest.mark.django_db
def test_generate_ahjo_public_decision_text_xml(application_with_ahjo_decision):
    decision = AhjoDecisionText.objects.get(application=application_with_ahjo_decision)
    attachment = generate_application_attachment(
        application_with_ahjo_decision, AttachmentType.DECISION_TEXT_XML, decision
    )
    assert isinstance(attachment, Attachment)

    assert attachment.application == application_with_ahjo_decision
    assert attachment.content_type == "application/xml"
    assert attachment.attachment_type == AttachmentType.DECISION_TEXT_XML

    assert attachment.attachment_file.size > 0
    assert os.path.exists(attachment.attachment_file.path)
    if os.path.exists(attachment.attachment_file.path):
        os.remove(attachment.attachment_file.path)


@pytest.mark.django_db
def test_generate_ahjo_secret_decision_text_xml(decided_application):
    attachment = generate_application_attachment(
        decided_application, AttachmentType.DECISION_TEXT_SECRET_XML
    )
    assert isinstance(attachment, Attachment)

    assert attachment.application == decided_application
    assert attachment.content_type == "application/xml"
    assert attachment.attachment_type == AttachmentType.DECISION_TEXT_SECRET_XML

    assert attachment.attachment_file.size > 0
    assert os.path.exists(attachment.attachment_file.path)
    if os.path.exists(attachment.attachment_file.path):
        os.remove(attachment.attachment_file.path)


@pytest.mark.parametrize(
    "ahjo_request_type, query_parameters,retry_failed_older_than_hours",
    [
        (
            AhjoRequestType.OPEN_CASE,
            {
                "application_statuses": [
                    ApplicationStatus.HANDLING,
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO],
                "has_no_case_id": True,
                "retry_status": AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT,
            },
            0,
        ),
        (
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [
                    AhjoStatusEnum.CASE_OPENED,
                    AhjoStatusEnum.NEW_RECORDS_RECEIVED,
                ],
                "has_no_case_id": False,
                "retry_status": AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            },
            0,
        ),
        (
            AhjoRequestType.UPDATE_APPLICATION,
            {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [
                    AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
                    AhjoStatusEnum.NEW_RECORDS_RECEIVED,
                ],
                "has_no_case_id": False,
                "retry_status": AhjoStatusEnum.UPDATE_REQUEST_SENT,
            },
            0,
        ),
        (
            AhjoRequestType.DELETE_APPLICATION,
            {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.CANCELLED,
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.HANDLING,
                    ApplicationStatus.DRAFT,
                    ApplicationStatus.RECEIVED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SCHEDULED_FOR_DELETION],
                "has_no_case_id": False,
                "retry_status": AhjoStatusEnum.DELETE_REQUEST_SENT,
            },
            0,
        ),
        (
            AhjoRequestType.GET_DECISION_DETAILS,
            {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SIGNED_IN_AHJO],
                "has_no_case_id": False,
                "retry_status": AhjoStatusEnum.DECISION_DETAILS_REQUEST_SENT,
            },
            0,
        ),
        (
            AhjoRequestType.OPEN_CASE,
            {
                "application_statuses": [
                    ApplicationStatus.HANDLING,
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO],
                "has_no_case_id": True,
                "retry_status": AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT,
            },
            1,
        ),
        (
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [
                    AhjoStatusEnum.CASE_OPENED,
                    AhjoStatusEnum.NEW_RECORDS_RECEIVED,
                ],
                "has_no_case_id": False,
                "retry_status": AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            },
            1,
        ),
        (
            AhjoRequestType.UPDATE_APPLICATION,
            {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [
                    AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
                    AhjoStatusEnum.NEW_RECORDS_RECEIVED,
                ],
                "has_no_case_id": False,
                "retry_status": AhjoStatusEnum.UPDATE_REQUEST_SENT,
            },
            1,
        ),
        (
            AhjoRequestType.DELETE_APPLICATION,
            {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.CANCELLED,
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.HANDLING,
                    ApplicationStatus.DRAFT,
                    ApplicationStatus.RECEIVED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SCHEDULED_FOR_DELETION],
                "has_no_case_id": False,
                "retry_status": AhjoStatusEnum.DELETE_REQUEST_SENT,
            },
            1,
        ),
        (
            AhjoRequestType.GET_DECISION_DETAILS,
            {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SIGNED_IN_AHJO],
                "has_no_case_id": False,
                "retry_status": AhjoStatusEnum.DECISION_DETAILS_REQUEST_SENT,
            },
            1,
        ),
    ],
)
@pytest.mark.django_db
def test_ahjo_query_parameter_resolver(
    ahjo_request_type, query_parameters, retry_failed_older_than_hours
):
    parameters = AhjoQueryParameters.resolve(
        ahjo_request_type, retry_failed_older_than_hours
    )
    if retry_failed_older_than_hours:
        assert (
            parameters["retry_failed_older_than_hours"] == retry_failed_older_than_hours
        )
    else:
        assert parameters == query_parameters


@pytest.fixture
def mock_get_by_statuses():
    with patch(
        "applications.models.Application.objects.get_by_statuses", autospec=True
    ) as mock:
        yield mock


@pytest.fixture
def mock_get_for_ahjo_decision():
    with patch(
        "applications.models.Application.objects.get_for_ahjo_decision", autospec=True
    ) as mock:
        yield mock


@pytest.fixture
def mock_with_non_downloaded_attachments():
    with patch(
        "applications.models.Application.objects.with_non_downloaded_attachments",
        autospec=True,
    ) as mock:
        yield mock


@pytest.mark.parametrize(
    "request_type",
    [
        (AhjoRequestType.OPEN_CASE),
        (AhjoRequestType.SEND_DECISION_PROPOSAL),
        (AhjoRequestType.UPDATE_APPLICATION),
        (AhjoRequestType.DELETE_APPLICATION),
        (AhjoRequestType.GET_DECISION_DETAILS),
    ],
)
@pytest.mark.django_db
def test_applications_service(
    request_type, mock_get_by_statuses, mock_get_for_ahjo_decision
):
    parameters = AhjoQueryParameters.resolve(
        request_type
    )  # Example parameters, adjust as needed

    with patch(
        "applications.services.ahjo_application_service.AhjoQueryParameters.resolve",
        return_value=parameters,
    ):
        AhjoApplicationsService.get_applications_for_request(request_type)

    if request_type == AhjoRequestType.SEND_DECISION_PROPOSAL:
        mock_get_for_ahjo_decision.assert_called_once_with(**parameters)
    else:
        mock_get_by_statuses.assert_called_once_with(**parameters)


@pytest.fixture
def wanted_open_case_attachments():
    return [
        AttachmentType.EMPLOYMENT_CONTRACT,
        AttachmentType.PAY_SUBSIDY_DECISION,
        AttachmentType.COMMISSION_CONTRACT,
        AttachmentType.EDUCATION_CONTRACT,
        AttachmentType.HELSINKI_BENEFIT_VOUCHER,
        AttachmentType.EMPLOYEE_CONSENT,
        AttachmentType.OTHER_ATTACHMENT,
        AttachmentType.FULL_APPLICATION,
    ]


@pytest.fixture
def unwanted_open_case_attachments():
    return [
        AttachmentType.PDF_SUMMARY,
        AttachmentType.DECISION_TEXT_XML,
        AttachmentType.DECISION_TEXT_SECRET_XML,
    ]


@pytest.mark.parametrize(
    "retry_failed_older_than_hours, latest_ahjo_status",
    [
        (0, AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO),
        (1, AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT),
    ],
)
@pytest.mark.django_db
def test_get_applications_for_open_case_request(
    multiple_decided_applications,
    multiple_decided_applications_for_open_case,
    multiple_handling_applications,
    wanted_open_case_attachments,
    unwanted_open_case_attachments,
    retry_failed_older_than_hours,
    latest_ahjo_status,
):
    now = timezone.now()
    wanted_applications_for_open_case = (
        multiple_decided_applications_for_open_case + multiple_handling_applications
    )
    for application in wanted_applications_for_open_case:
        status = AhjoStatus.objects.create(
            application=application,
            status=latest_ahjo_status,
        )

        status.created_at = now - timedelta(days=1)
        status.save()

    # create all possible statuses for decided_applications, one day apart in the future
    for application in multiple_decided_applications:
        for index, value in enumerate(AhjoStatusEnum.choices):
            ahjo_status = AhjoStatus.objects.create(
                application=application,
                status=value[0],
            )
            ahjo_status.created_at = now + timedelta(days=index)
            ahjo_status.save()

    parameters = AhjoQueryParameters.resolve(
        AhjoRequestType.OPEN_CASE, retry_failed_older_than_hours
    )

    applications_for_open_case = Application.objects.get_by_statuses(**parameters)

    for app in applications_for_open_case:
        attachments = app.attachments.all()
        for a in attachments:
            assert a.attachment_type in wanted_open_case_attachments
            assert a.attachment_type not in unwanted_open_case_attachments
    # only handled_applications should be returned as their last  AhjoStatus is
    # SUBMITTED_BUT_NOT_SENT_TO_AHJO
    # and their application status is HANDLING
    assert applications_for_open_case.count() == len(wanted_applications_for_open_case)


@pytest.mark.parametrize(
    "latest_ahjo_status, retry_failed_older_than_hours",
    [
        (AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED, 0),
        (AhjoStatusEnum.NEW_RECORDS_RECEIVED, 0),
        (AhjoStatusEnum.UPDATE_REQUEST_SENT, 1),
        (AhjoStatusEnum.UPDATE_REQUEST_SENT, 24),
    ],
)
@pytest.mark.django_db
def test_get_applications_for_update_request(
    multiple_applications_with_ahjo_case_id,
    latest_ahjo_status,
    retry_failed_older_than_hours,
):
    now = timezone.now()

    for a in multiple_applications_with_ahjo_case_id[:5]:
        ahjo_status = AhjoStatus.objects.create(
            application=a,
            status=latest_ahjo_status,
        )
        ahjo_status.created_at = (
            now - timedelta(hours=retry_failed_older_than_hours) - timedelta(minutes=1)
        )
        ahjo_status.save()

    for a in multiple_applications_with_ahjo_case_id[5:]:
        ahjo_status = AhjoStatus.objects.create(
            application=a,
            status=latest_ahjo_status,
        )
        ahjo_status.created_at = (
            now - timedelta(hours=retry_failed_older_than_hours) - timedelta(minutes=1)
        )
        ahjo_status.save()

    parameters = AhjoQueryParameters.resolve(
        AhjoRequestType.UPDATE_APPLICATION, retry_failed_older_than_hours
    )
    for application in multiple_applications_with_ahjo_case_id:
        print(application.ahjo_status.latest().status)  # noqa: T201

    applications_for_ahjo_update = Application.objects.get_by_statuses(**parameters)

    assert applications_for_ahjo_update.count() == len(
        multiple_applications_with_ahjo_case_id
    )


@pytest.mark.parametrize(
    "application_status, latest_ahjo_status, retry_failed_older_than_hours",
    [
        (ApplicationStatus.ACCEPTED, AhjoStatusEnum.SCHEDULED_FOR_DELETION, 0),
        (ApplicationStatus.CANCELLED, AhjoStatusEnum.SCHEDULED_FOR_DELETION, 0),
        (ApplicationStatus.REJECTED, AhjoStatusEnum.SCHEDULED_FOR_DELETION, 0),
        (ApplicationStatus.HANDLING, AhjoStatusEnum.SCHEDULED_FOR_DELETION, 0),
        (ApplicationStatus.DRAFT, AhjoStatusEnum.SCHEDULED_FOR_DELETION, 0),
        (ApplicationStatus.RECEIVED, AhjoStatusEnum.DELETE_REQUEST_SENT, 1),
        (ApplicationStatus.ACCEPTED, AhjoStatusEnum.DELETE_REQUEST_SENT, 1),
        (ApplicationStatus.CANCELLED, AhjoStatusEnum.DELETE_REQUEST_SENT, 1),
        (ApplicationStatus.REJECTED, AhjoStatusEnum.DELETE_REQUEST_SENT, 1),
        (ApplicationStatus.HANDLING, AhjoStatusEnum.DELETE_REQUEST_SENT, 1),
        (ApplicationStatus.DRAFT, AhjoStatusEnum.DELETE_REQUEST_SENT, 1),
        (ApplicationStatus.RECEIVED, AhjoStatusEnum.DELETE_REQUEST_SENT, 1),
    ],
)
@pytest.mark.django_db
def test_get_applications_for_delete_request(
    handling_application,
    application_status,
    latest_ahjo_status,
    retry_failed_older_than_hours,
):
    now = timezone.now()

    handling_application.status = application_status
    handling_application.ahjo_case_id = "HEL 1999-123"
    handling_application.save()

    ahjo_status = AhjoStatus.objects.create(
        application_id=handling_application.id,
        status=latest_ahjo_status,
    )

    ahjo_status.created_at = (
        now - timedelta(hours=retry_failed_older_than_hours) - timedelta(minutes=1)
    )
    ahjo_status.save()

    parameters = AhjoQueryParameters.resolve(
        AhjoRequestType.DELETE_APPLICATION, retry_failed_older_than_hours
    )

    applications_for_delete = Application.objects.get_by_statuses(**parameters)

    assert applications_for_delete.count() == 1
    assert applications_for_delete[0] == handling_application


@pytest.mark.django_db
def test_get_applications_for_add_records_request(decided_application):
    applications = Application.objects.with_non_downloaded_attachments()
    assert applications.count() == 0

    decided_application.ahjo_case_id = "HEL 1999-123"
    decided_application.save()

    applications = Application.objects.with_non_downloaded_attachments()
    assert applications.count() == 1

    attachments = applications[0].attachments.all()

    assert attachments.count() == 7
    for a in attachments:
        assert a.downloaded_by_ahjo is None
        assert a.attachment_type not in [
            AttachmentType.PDF_SUMMARY,
            AttachmentType.FULL_APPLICATION,
            AttachmentType.DECISION_TEXT_XML,
            AttachmentType.DECISION_TEXT_SECRET_XML,
        ]

    attachments[0].downloaded_by_ahjo = timezone.now()
    attachments[0].save()

    applications = Application.objects.with_non_downloaded_attachments()
    assert applications.count() == 1

    attachments = applications[0].attachments.all()
    assert attachments.count() == 6

    for a in attachments:
        a.downloaded_by_ahjo = timezone.now()
        a.save()

    applications = Application.objects.with_non_downloaded_attachments()
    assert applications.count() == 0


dummy_case_id = "HEL 1999-123"


@pytest.mark.parametrize(
    "application_status, ahjo_status, talpa_status, case_id, decision_text, count",
    [
        (
            ApplicationStatus.DRAFT,
            AhjoStatusEnum.CASE_OPENED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            False,
            0,
        ),
        (
            ApplicationStatus.HANDLING,
            AhjoStatusEnum.CASE_OPENED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            False,
            0,
        ),
        (
            ApplicationStatus.RECEIVED,
            AhjoStatusEnum.CASE_OPENED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            False,
            0,
        ),
        (
            ApplicationStatus.CANCELLED,
            AhjoStatusEnum.CASE_OPENED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            False,
            0,
        ),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            AhjoStatusEnum.CASE_OPENED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            False,
            0,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.CASE_OPENED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            True,
            1,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.CASE_OPENED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            True,
            1,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            True,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            True,
            0,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            True,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            True,
            0,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.NEW_RECORDS_RECEIVED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            True,
            1,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.NEW_RECORDS_RECEIVED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            True,
            1,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.NEW_RECORDS_RECEIVED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            False,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.NEW_RECORDS_RECEIVED,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            dummy_case_id,
            False,
            0,
        ),
    ],
)
@pytest.mark.django_db
def test_get_applications_for_ahjo_decision_proposal_request(
    decided_application,
    application_status,
    ahjo_status,
    talpa_status,
    case_id,
    decision_text,
    count,
):
    decided_application.status = application_status
    decided_application.talpa_status = talpa_status
    decided_application.ahjo_case_id = case_id
    decided_application.save()

    decided_application.ahjo_status.create(status=ahjo_status)

    if decision_text:
        AhjoDecisionText.objects.create(
            application=decided_application, decision_text="test"
        )
    parameters = AhjoQueryParameters.resolve(AhjoRequestType.SEND_DECISION_PROPOSAL)
    applications = Application.objects.get_for_ahjo_decision(**parameters)
    assert applications.count() == count


@pytest.mark.parametrize(
    "application_status, latest_ahjo_status, talpa_status,"
    " retry_failed_older_than_hours, wanted_count",
    [
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            1,
            1,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
            1,
            1,
        ),
    ],
)
@pytest.mark.django_db
def test_retry_get_applications_for_ahjo_decision_proposal_request(
    application_with_ahjo_case_id,
    application_status,
    latest_ahjo_status,
    talpa_status,
    retry_failed_older_than_hours,
    wanted_count,
):
    application_with_ahjo_case_id.status = application_status
    application_with_ahjo_case_id.talpa_status = talpa_status
    application_with_ahjo_case_id.save()

    ahjo_status = AhjoStatus.objects.create(
        application_id=application_with_ahjo_case_id.id,
        status=latest_ahjo_status,
    )

    ahjo_status.created_at = (
        timezone.now()
        - timedelta(hours=retry_failed_older_than_hours)
        - timedelta(minutes=1)
    )
    ahjo_status.save()

    AhjoDecisionText.objects.create(
        application=application_with_ahjo_case_id, decision_text="test"
    )
    parameters = AhjoQueryParameters.resolve(
        AhjoRequestType.SEND_DECISION_PROPOSAL, retry_failed_older_than_hours
    )
    applications = Application.objects.get_for_ahjo_decision(**parameters)
    assert applications.count() == wanted_count
    assert applications.first() == application_with_ahjo_case_id


@pytest.mark.parametrize(
    "application_status, ahjo_status, case_id, count",
    [
        (
            ApplicationStatus.DRAFT,
            AhjoStatusEnum.CASE_OPENED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.HANDLING,
            AhjoStatusEnum.CASE_OPENED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.RECEIVED,
            AhjoStatusEnum.CASE_OPENED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.CANCELLED,
            AhjoStatusEnum.CASE_OPENED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            AhjoStatusEnum.CASE_OPENED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.CASE_OPENED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.CASE_OPENED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.NEW_RECORDS_RECEIVED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.NEW_RECORDS_RECEIVED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.NEW_RECORDS_RECEIVED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.NEW_RECORDS_RECEIVED,
            dummy_case_id,
            0,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoStatusEnum.SIGNED_IN_AHJO,
            dummy_case_id,
            1,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoStatusEnum.SIGNED_IN_AHJO,
            dummy_case_id,
            1,
        ),
    ],
)
@pytest.mark.django_db
def test_get_applications_for_ahjo_details_request(
    decided_application,
    application_status,
    ahjo_status,
    case_id,
    count,
):
    decided_application.status = application_status
    decided_application.ahjo_case_id = case_id
    decided_application.save()

    decided_application.ahjo_status.create(status=ahjo_status)

    parameters = AhjoQueryParameters.resolve(AhjoRequestType.GET_DECISION_DETAILS)
    applications = Application.objects.get_by_statuses(**parameters)
    assert applications.count() == count
    if count:
        assert applications.first() == decided_application


@pytest.mark.parametrize(
    "application_status, latest_ahjo_status, retry_failed_older_than_hours",
    [
        (ApplicationStatus.ACCEPTED, AhjoStatusEnum.DECISION_DETAILS_REQUEST_SENT, 1),
        (ApplicationStatus.REJECTED, AhjoStatusEnum.DECISION_DETAILS_REQUEST_SENT, 1),
    ],
)
@pytest.mark.django_db
def test_retry_get_applications_for_ahjo_details_request(
    application_with_ahjo_case_id,
    application_status,
    latest_ahjo_status,
    retry_failed_older_than_hours,
):
    now = timezone.now()
    application_with_ahjo_case_id.status = application_status

    application_with_ahjo_case_id.save()

    ahjo_status = AhjoStatus.objects.create(
        application_id=application_with_ahjo_case_id.id,
        status=latest_ahjo_status,
    )

    ahjo_status.created_at = (
        now - timedelta(hours=retry_failed_older_than_hours) - timedelta(minutes=1)
    )
    ahjo_status.save()

    parameters = AhjoQueryParameters.resolve(
        AhjoRequestType.GET_DECISION_DETAILS, retry_failed_older_than_hours
    )
    applications = Application.objects.get_by_statuses(**parameters)
    assert applications.count() == 1
    assert applications.first() == application_with_ahjo_case_id


@pytest.mark.parametrize(
    "initial_ahjo_status, expected_status, status_message, status_after",
    [
        (
            AhjoStatusEnum.CASE_OPENED,
            200,
            "Application scheduled for cancellation in Ahjo",
            AhjoStatusEnum.SCHEDULED_FOR_DELETION,
        ),
        (
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            400,
            "Cannot delete because a decision proposal has been sent to Ahjo",
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
        ),
    ],
)
@pytest.mark.django_db
def test_delete_application_ahjo_api(
    decided_application,
    handler_api_client,
    initial_ahjo_status,
    expected_status,
    status_message,
    status_after,
):
    status = AhjoStatus.objects.create(
        application=decided_application, status=initial_ahjo_status
    )
    status.created_at = timezone.now() - timedelta(days=1)
    status.save()

    url = reverse(
        "ahjo_application_url",
        kwargs={"uuid": decided_application.id},
    )
    response = handler_api_client.delete(url)

    decided_application.refresh_from_db()

    assert response.status_code == expected_status
    assert response.data == {"message": status_message}
    assert decided_application.ahjo_status.latest().status == status_after
