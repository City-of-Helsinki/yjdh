from unittest import mock

import pytest
from django.contrib.auth import get_user_model
from django.test import Client, override_settings
from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse

from applications.enums import EmployerApplicationStatus, YouthApplicationStatus
from applications.models import Attachment, Company, YouthApplication
from applications.tests.data.mock_vtj import mock_vtj_person_id_query_found_content
from common.tests.factories import (
    AdditionalInfoRequestedYouthApplicationFactory,
    AttachmentFactory,
    CompanyFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    InactiveNeedAdditionalInfoYouthApplicationFactory,
    InactiveNoNeedAdditionalInfoYouthApplicationFactory,
    YouthApplicationFactory,
)
from common.tests.utils import set_company_business_id_to_client
from common.urls import handler_403_url
from shared.common.tests.conftest import force_login_user
from shared.common.tests.factories import UserFactory

User = get_user_model()


def create_attachment(
    user: User, company: Company, status: EmployerApplicationStatus
) -> Attachment:
    """
    Create an attachment with an employer summer voucher and employer application.

    Refresh the attachment, employer summer voucher and employer application from
    database to ensure that the data is up to date.

    :return: Attachment that has an employer summer voucher and employer application.
             The employer application has the given user, company and status.
    """
    result = AttachmentFactory(
        summer_voucher=EmployerSummerVoucherFactory(
            application=EmployerApplicationFactory(
                user=user, company=company, status=status
            )
        )
    )
    result.refresh_from_db()
    result.summer_voucher.refresh_from_db()
    result.summer_voucher.application.refresh_from_db()
    assert result.summer_voucher.application.user == user
    assert result.summer_voucher.application.company == company
    assert result.summer_voucher.application.status == status
    return result


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "application_status",
    [
        EmployerApplicationStatus.DRAFT,
        EmployerApplicationStatus.SUBMITTED,
    ],
)
@pytest.mark.django_db
def test_employer_application_list_viewable_statuses(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer application list endpoint returns draft and submitted
    employer applications but only those that are the user's and use the user's company.
    """
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    for user, client, company, attachment in [
        (user1, user1_client, company1, user1_company1_attachment),
        (user1, user1_client, company2, user1_company2_attachment),
        (user2, user2_client, company1, user2_company1_attachment),
        (user2, user2_client, company2, user2_company2_attachment),
    ]:
        set_company_business_id_to_client(company, client)
        response = client.get(reverse("v1:employerapplication-list"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["id"] == str(attachment.summer_voucher.application.id)
        assert response.data[0]["user"] == user.id
        assert response.data[0]["company"]["id"] == str(company.id)


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "application_status",
    [
        EmployerApplicationStatus.DRAFT,
        EmployerApplicationStatus.SUBMITTED,
    ],
)
@pytest.mark.django_db
def test_employer_application_detail_viewable_statuses(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer application detail endpoint returns draft and submitted
    employer applications but only those that are the user's and use the user's company.
    """
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    def get_app(client: Client, attachment: Attachment):
        application = attachment.summer_voucher.application
        return client.get(
            reverse("v1:employerapplication-detail", kwargs={"pk": application.id})
        )

    # The status code 200s are the ones that match both the user and the company:
    set_company_business_id_to_client(company1, user1_client)
    assert get_app(user1_client, user1_company1_attachment).status_code == 200
    assert get_app(user1_client, user1_company2_attachment).status_code == 404
    assert get_app(user1_client, user2_company1_attachment).status_code == 404
    assert get_app(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company1, user2_client)
    assert get_app(user2_client, user1_company1_attachment).status_code == 404
    assert get_app(user2_client, user1_company2_attachment).status_code == 404
    assert get_app(user2_client, user2_company1_attachment).status_code == 200
    assert get_app(user2_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user1_client)
    assert get_app(user1_client, user1_company1_attachment).status_code == 404
    assert get_app(user1_client, user1_company2_attachment).status_code == 200
    assert get_app(user1_client, user2_company1_attachment).status_code == 404
    assert get_app(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user2_client)
    assert get_app(user2_client, user1_company1_attachment).status_code == 404
    assert get_app(user2_client, user1_company2_attachment).status_code == 404
    assert get_app(user2_client, user2_company1_attachment).status_code == 404
    assert get_app(user2_client, user2_company2_attachment).status_code == 200


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "application_status",
    [
        EmployerApplicationStatus.DRAFT,
        EmployerApplicationStatus.SUBMITTED,
    ],
)
@pytest.mark.django_db
def test_employer_summer_voucher_handle_attachment_viewable_statuses(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer summer voucher's handle attachment endpoint returns draft and
    submitted employer applications' attachments but only those that are the user's and
    use the user's company.
    """
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    def get_attachment(client: Client, attachment: Attachment):
        return client.get(
            reverse(
                "v1:employersummervoucher-handle-attachment",
                kwargs={
                    "pk": attachment.summer_voucher.id,
                    "attachment_pk": attachment.id,
                },
            )
        )

    # The status code 200s are the ones that match both the user and the company:
    set_company_business_id_to_client(company1, user1_client)
    assert get_attachment(user1_client, user1_company1_attachment).status_code == 200
    assert get_attachment(user1_client, user1_company2_attachment).status_code == 404
    assert get_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert get_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company1, user2_client)
    assert get_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert get_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert get_attachment(user2_client, user2_company1_attachment).status_code == 200
    assert get_attachment(user2_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user1_client)
    assert get_attachment(user1_client, user1_company1_attachment).status_code == 404
    assert get_attachment(user1_client, user1_company2_attachment).status_code == 200
    assert get_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert get_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user2_client)
    assert get_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert get_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert get_attachment(user2_client, user2_company1_attachment).status_code == 404
    assert get_attachment(user2_client, user2_company2_attachment).status_code == 200


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "application_status",
    [
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        EmployerApplicationStatus.ACCEPTED,
        EmployerApplicationStatus.REJECTED,
        EmployerApplicationStatus.DELETED_BY_CUSTOMER,
    ],
)
@pytest.mark.django_db
def test_employer_summer_voucher_handle_attachment_non_viewable_statuses(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer summer voucher's handle attachment endpoint doesn't return
    any attachments that are connected to an employer application which is neither a
    draft nor submitted.
    """
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    def get_attachment(client: Client, attachment: Attachment):
        return client.get(
            reverse(
                "v1:employersummervoucher-handle-attachment",
                kwargs={
                    "pk": attachment.summer_voucher.id,
                    "attachment_pk": attachment.id,
                },
            )
        )

    set_company_business_id_to_client(company1, user1_client)
    assert get_attachment(user1_client, user1_company1_attachment).status_code == 404
    assert get_attachment(user1_client, user1_company2_attachment).status_code == 404
    assert get_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert get_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company1, user2_client)
    assert get_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert get_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert get_attachment(user2_client, user2_company1_attachment).status_code == 404
    assert get_attachment(user2_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user1_client)
    assert get_attachment(user1_client, user1_company1_attachment).status_code == 404
    assert get_attachment(user1_client, user1_company2_attachment).status_code == 404
    assert get_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert get_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user2_client)
    assert get_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert get_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert get_attachment(user2_client, user2_company1_attachment).status_code == 404
    assert get_attachment(user2_client, user2_company2_attachment).status_code == 404


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_employer_summer_voucher_handle_attachment_delete_draft():
    """
    Test that the employer summer voucher's handle attachment endpoint can be used to
    delete draft employer applications' attachments but only those that are the user's
    and use the user's company.
    """
    application_status = EmployerApplicationStatus.DRAFT
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    def del_attachment(client: Client, attachment: Attachment):
        return client.delete(
            reverse(
                "v1:employersummervoucher-handle-attachment",
                kwargs={
                    "pk": attachment.summer_voucher.id,
                    "attachment_pk": attachment.id,
                },
            )
        )

    # Unallowed deletions
    set_company_business_id_to_client(company1, user1_client)
    assert del_attachment(user1_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company1, user2_client)
    assert del_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user1_client)
    assert del_attachment(user1_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user2_client)
    assert del_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company1_attachment).status_code == 404

    # Allowed deletions
    set_company_business_id_to_client(company1, user1_client)
    assert del_attachment(user1_client, user1_company1_attachment).status_code == 204

    set_company_business_id_to_client(company1, user2_client)
    assert del_attachment(user2_client, user2_company1_attachment).status_code == 204

    set_company_business_id_to_client(company2, user1_client)
    assert del_attachment(user1_client, user1_company2_attachment).status_code == 204

    set_company_business_id_to_client(company2, user2_client)
    assert del_attachment(user2_client, user2_company2_attachment).status_code == 204


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_employer_summer_voucher_handle_attachment_delete_submitted():
    """
    Test that the employer summer voucher's handle attachment endpoint can not be used
    to delete submitted employer applications' attachments at all, not the user's and
    the user's company's nor anyone else's.
    """
    application_status = EmployerApplicationStatus.SUBMITTED
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    def del_attachment(client: Client, attachment: Attachment):
        return client.delete(
            reverse(
                "v1:employersummervoucher-handle-attachment",
                kwargs={
                    "pk": attachment.summer_voucher.id,
                    "attachment_pk": attachment.id,
                },
            )
        )

    # The status code 400s are the ones that match both the user and the company:
    set_company_business_id_to_client(company1, user1_client)
    assert del_attachment(user1_client, user1_company1_attachment).status_code == 400
    assert del_attachment(user1_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company1, user2_client)
    assert del_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company1_attachment).status_code == 400
    assert del_attachment(user2_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user1_client)
    assert del_attachment(user1_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user1_company2_attachment).status_code == 400
    assert del_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user2_client)
    assert del_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company2_attachment).status_code == 400


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "application_status",
    [
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        EmployerApplicationStatus.ACCEPTED,
        EmployerApplicationStatus.REJECTED,
        EmployerApplicationStatus.DELETED_BY_CUSTOMER,
    ],
)
@pytest.mark.django_db
def test_employer_summer_voucher_handle_attachment_delete_non_viewable_statuses(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer summer voucher's handle attachment endpoint can't be used to
    delete any attachments that are connected to an employer application which is
    neither a draft nor submitted.
    """
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    def del_attachment(client: Client, attachment: Attachment):
        return client.delete(
            reverse(
                "v1:employersummervoucher-handle-attachment",
                kwargs={
                    "pk": attachment.summer_voucher.id,
                    "attachment_pk": attachment.id,
                },
            )
        )

    set_company_business_id_to_client(company1, user1_client)
    assert del_attachment(user1_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company1, user2_client)
    assert del_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user1_client)
    assert del_attachment(user1_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user2_client)
    assert del_attachment(user2_client, user1_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user1_company2_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company1_attachment).status_code == 404
    assert del_attachment(user2_client, user2_company2_attachment).status_code == 404


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize("application_status", EmployerApplicationStatus.values)
@pytest.mark.django_db
def test_employer_summer_voucher_handle_attachment_unallowed_methods(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer summer voucher's handle attachment endpoint doesn't allow
    HTTP methods patch, post and put.
    """
    user = UserFactory()
    company = CompanyFactory()
    user_client = force_login_user(user)
    attachment = create_attachment(user, company, application_status)
    url = reverse(
        "v1:employersummervoucher-handle-attachment",
        kwargs={
            "pk": attachment.summer_voucher.id,
            "attachment_pk": attachment.id,
        },
    )
    set_company_business_id_to_client(company, user_client)
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.post(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize("application_status", EmployerApplicationStatus.values)
@pytest.mark.django_db
def test_employer_summer_voucher_post_attachment_unallowed_methods(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer summer voucher's post attachment endpoint doesn't allow
    HTTP methods delete, get, patch and put.
    """
    user = UserFactory()
    company = CompanyFactory()
    user_client = force_login_user(user)
    attachment = create_attachment(user, company, application_status)
    url = reverse(
        "v1:employersummervoucher-post-attachment",
        kwargs={"pk": attachment.summer_voucher.id},
    )
    set_company_business_id_to_client(company, user_client)
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.get(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize("application_status", EmployerApplicationStatus.values)
@pytest.mark.django_db
def test_employer_summer_voucher_detail_unallowed_methods(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer summer voucher detail endpoint doesn't allow HTTP methods
    delete, get, patch, post and put.
    """
    user = UserFactory()
    company = CompanyFactory()
    user_client = force_login_user(user)
    attachment = create_attachment(user, company, application_status)
    url = reverse(
        "v1:employersummervoucher-detail", kwargs={"pk": attachment.summer_voucher.id}
    )
    set_company_business_id_to_client(company, user_client)
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.get(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.post(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "application_status",
    [
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        EmployerApplicationStatus.ACCEPTED,
        EmployerApplicationStatus.REJECTED,
        EmployerApplicationStatus.DELETED_BY_CUSTOMER,
    ],
)
@pytest.mark.django_db
def test_employer_application_list_non_viewable_statuses(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer application list endpoint doesn't return any employer
    applications at all for statuses that are not draft or submitted.
    """
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    for user, client, company, attachment in [
        (user1, user1_client, company1, user1_company1_attachment),
        (user1, user1_client, company2, user1_company2_attachment),
        (user2, user2_client, company1, user2_company1_attachment),
        (user2, user2_client, company2, user2_company2_attachment),
    ]:
        set_company_business_id_to_client(company, client)
        response = client.get(reverse("v1:employerapplication-list"))
        assert response.status_code == status.HTTP_200_OK
        assert not response.data


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "application_status",
    [
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        EmployerApplicationStatus.ACCEPTED,
        EmployerApplicationStatus.REJECTED,
        EmployerApplicationStatus.DELETED_BY_CUSTOMER,
    ],
)
@pytest.mark.django_db
def test_employer_application_detail_non_viewable_statuses(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer application detail endpoint doesn't return any employer
    applications at all for statuses that are not draft or submitted.
    """
    user1, user2 = UserFactory.create_batch(size=2)
    user1_client = force_login_user(user1)
    user2_client = force_login_user(user2)

    company1, company2 = CompanyFactory.create_batch(size=2)

    user1_company1_attachment = create_attachment(user1, company1, application_status)
    user1_company2_attachment = create_attachment(user1, company2, application_status)
    user2_company1_attachment = create_attachment(user2, company1, application_status)
    user2_company2_attachment = create_attachment(user2, company2, application_status)

    def get_app(client: Client, attachment: Attachment):
        application = attachment.summer_voucher.application
        return client.get(
            reverse("v1:employerapplication-detail", kwargs={"pk": application.id})
        )

    set_company_business_id_to_client(company1, user1_client)
    assert get_app(user1_client, user1_company1_attachment).status_code == 404
    assert get_app(user1_client, user1_company2_attachment).status_code == 404
    assert get_app(user1_client, user2_company1_attachment).status_code == 404
    assert get_app(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company1, user2_client)
    assert get_app(user2_client, user1_company1_attachment).status_code == 404
    assert get_app(user2_client, user1_company2_attachment).status_code == 404
    assert get_app(user2_client, user2_company1_attachment).status_code == 404
    assert get_app(user2_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user1_client)
    assert get_app(user1_client, user1_company1_attachment).status_code == 404
    assert get_app(user1_client, user1_company2_attachment).status_code == 404
    assert get_app(user1_client, user2_company1_attachment).status_code == 404
    assert get_app(user1_client, user2_company2_attachment).status_code == 404

    set_company_business_id_to_client(company2, user2_client)
    assert get_app(user2_client, user1_company1_attachment).status_code == 404
    assert get_app(user2_client, user1_company2_attachment).status_code == 404
    assert get_app(user2_client, user2_company1_attachment).status_code == 404
    assert get_app(user2_client, user2_company2_attachment).status_code == 404


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_employer_application_list_unallowed_methods(
    user_client,
):
    """
    Test that the employer application list endpoint doesn't allow HTTP methods delete,
    patch and put.
    """
    url = reverse("v1:employerapplication-list")
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize("application_status", EmployerApplicationStatus.values)
@pytest.mark.django_db
def test_employer_application_detail_unallowed_methods(
    application_status: EmployerApplicationStatus,
):
    """
    Test that the employer application detail endpoint doesn't allow HTTP methods delete
    and post.
    """
    user = UserFactory()
    company = CompanyFactory()
    user_client = force_login_user(user)
    attachment = create_attachment(user, company, application_status)
    application = attachment.summer_voucher.application
    url = reverse("v1:employerapplication-detail", kwargs={"pk": application.id})
    set_company_business_id_to_client(company, user_client)
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.post(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "excel_download_url",
    [
        reverse("excel-download"),
        f'{reverse("excel-download")}?download=annual',
        f'{reverse("excel-download")}?download=unhandled',
        reverse("youth-excel-download"),
    ],
)
@pytest.mark.django_db
def test_excel_download_endpoints_redirect_to_forbidden_page(
    user_client, excel_download_url
):
    """
    Test that excel download endpoints using get redirect to forbidden page.
    """
    response = user_client.get(excel_download_url)
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == handler_403_url()


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_list_unallowed_methods(
    user_client,
):
    """
    Test that the youth application list endpoint doesn't allow HTTP methods delete,
    get, patch and put.
    """
    url = reverse("v1:youthapplication-list")
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.get(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_list_empty_post(user_client):
    """
    Test that an empty post to youth application list endpoint results in a bad request.
    """
    response = user_client.post(reverse("v1:youthapplication-list"))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@freeze_time("2022-02-02")
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    EMAIL_HOST="",  # Use inexistent email host to ensure emails will never go anywhere
    NEXT_PUBLIC_DISABLE_VTJ=False,
    NEXT_PUBLIC_MOCK_FLAG=False,
)
@pytest.mark.django_db
def test_youth_application_list_valid_post(user_client):
    """
    Test that a valid post request to the youth application list endpoint creates a new
    youth application and only returns the posted data itself, the created youth
    application's ID, status, created_at, modified_at, receipt_confirmed_at, handled_at,
    handler, additional_info_description, additional_info_provided_at and
    additional_info_user_reasons fields and nothing else.

    The posted data contains personal data like e.g. person's name and their social
    security number and that data is returned in the response. This is ok because the
    user posted the data themselves.
    """

    list_url = reverse("v1:youthapplication-list")
    post_data = {
        "first_name": "First name",
        "last_name": "Last name",
        "social_security_number": "111111-111C",
        "school": "Test school",
        "is_unlisted_school": False,
        "email": "test@example.org",
        "phone_number": "+358 12 3456789",
        "postcode": "00100",
        "language": "fi",
    }

    assert YouthApplication.objects.count() == 0

    mock_vtj_data = mock_vtj_person_id_query_found_content(
        first_name="First name",
        last_name="Last name",
        social_security_number="111111-111C",
        is_alive=True,
        is_home_municipality_helsinki=True,
    )

    with mock.patch(
        "applications.models.YouthApplication.fetch_vtj_json",
        return_value=mock_vtj_data,
    ) as mock_fetch_vtj_json:
        response = user_client.post(list_url, data=post_data)
        mock_fetch_vtj_json.assert_called_once()

    assert response.status_code == status.HTTP_201_CREATED

    assert YouthApplication.objects.count() == 1
    created_app = YouthApplication.objects.first()

    # Make extra sure the encrypted VTJ JSON fields were updated but not returned.
    # This is done because the VTJ JSON fields are extremely sensitive and should never
    # be returned to a user that is not a handler.
    assert created_app.encrypted_original_vtj_json == mock_vtj_data
    assert created_app.encrypted_handler_vtj_json == mock_vtj_data
    assert "encrypted_original_vtj_json" not in response.data
    assert "encrypted_handler_vtj_json" not in response.data

    assert response.data == {
        # The posted data itself:
        # NOTE: This is PERSONAL DATA but posted by the user so can be returned to them
        "first_name": "First name",
        "last_name": "Last name",
        "social_security_number": "111111-111C",
        "school": "Test school",
        "is_unlisted_school": False,
        "email": "test@example.org",
        "phone_number": "+358 12 3456789",
        "postcode": "00100",
        "language": "fi",
        # New field values i.e. these were not posted by the user:
        "id": str(created_app.id),
        "status": "submitted",
        "created_at": "2022-02-02T02:00:00+02:00",
        "modified_at": "2022-02-02T02:00:00+02:00",
        "receipt_confirmed_at": None,
        "handled_at": None,
        "handler": None,
        "additional_info_description": "",
        "additional_info_provided_at": None,
        "additional_info_user_reasons": [],
    }


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_employer_summer_voucher_list_unallowed_methods(
    user_client,
):
    """
    Test that the employer summer voucher list endpoint doesn't allow HTTP methods
    delete, get, patch, post and put.
    """
    url = reverse("v1:employersummervoucher-list")
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.get(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.post(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_school_list_openly_accessible_to_non_staff_user(user_client):
    """
    Test that the school list is openly accessible to a non-staff user.

    NOTE:
        This endpoint is open to anyone on purpose to be able to show the school list in
        the youth application's form. The school list is public information.
    """
    assert user_client.get(reverse("school-list")).status_code == status.HTTP_200_OK


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_company_openly_accessible_to_non_staff_user(user_client):
    """
    Test that the company endpoint is openly accessible to non-staff users and that it
    returns the business ID, city, company form, ID, industry, name, postcode and street
    address of the company and nothing else.

    NOTE:
        Any company's information can be queried by any non-staff user through this
        endpoint but as this is simply a cache for data queried from an open data
        endpoint under http://avoindata.prh.fi/opendata/tr/v1 this is not considered a
        security risk.
    """
    company = CompanyFactory(
        name="Test company",
        business_id="1234567-8",
        company_form="oy",
        industry="IT",
        street_address="Test street 1",
        postcode="00100",
        city="Test city",
    )
    set_company_business_id_to_client(company, user_client)

    response = user_client.get(reverse("company"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == {
        "business_id": "1234567-8",
        "city": "Test city",
        "company_form": "oy",
        "id": str(company.id),
        "industry": "IT",
        "name": "Test company",
        "postcode": "00100",
        "street_address": "Test street 1",
    }


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
@pytest.mark.parametrize("application_status", YouthApplicationStatus.values)
def test_youth_application_accept_patch_redirect_to_forbidden_page(
    user_client, application_status
):
    """
    Test that youth application accept endpoint using patch redirects to forbidden page.
    """
    application = YouthApplicationFactory(status=application_status)
    accept_url = reverse("v1:youthapplication-accept", kwargs={"pk": application.id})
    response = user_client.patch(accept_url)
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == handler_403_url()


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
@pytest.mark.parametrize("application_status", YouthApplicationStatus.values)
def test_youth_application_accept_unallowed_methods(user_client, application_status):
    """
    Test that youth application accept endpoint doesn't allow HTTP methods delete, get,
    post and put.
    """
    application = YouthApplicationFactory(status=application_status)
    url = reverse("v1:youthapplication-accept", kwargs={"pk": application.id})
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.get(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.post(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
@pytest.mark.parametrize("application_status", YouthApplicationStatus.values)
def test_youth_application_reject_patch_redirect_to_forbidden_page(
    user_client, application_status
):
    """
    Test that youth application reject endpoint using patch redirects to forbidden page.
    """
    application = YouthApplicationFactory(status=application_status)
    reject_url = reverse("v1:youthapplication-reject", kwargs={"pk": application.id})
    response = user_client.patch(reject_url)
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == handler_403_url()


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
@pytest.mark.parametrize("application_status", YouthApplicationStatus.values)
def test_youth_application_reject_unallowed_methods(user_client, application_status):
    """
    Test that youth application reject endpoint doesn't allow HTTP methods delete, get,
    post and put.
    """
    application = YouthApplicationFactory(status=application_status)
    url = reverse("v1:youthapplication-reject", kwargs={"pk": application.id})
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.get(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.post(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_status_openly_accessible_to_non_staff_user(user_client):
    """
    Test that youth application's status endpoint is openly accessible to non-staff
    users and returns only the single queried youth application's status and nothing
    else.

    NOTE:
        The youth application's status endpoint is open to everyone and can be used to
        see the status and existence/inexistence of any youth application in the system.
        To do this the user must know the queried youth application's ID value, which is
        not public information and which is supposed to be random as it is an UUID4.
        This was a conscious decision as the status is relatively harmless information,
        and it's useful in the additional info page which doesn't require any
        authentication or authorization to use.
    """
    app = AdditionalInfoRequestedYouthApplicationFactory()
    status_url = reverse("v1:youthapplication-status", kwargs={"pk": app.id})
    response = user_client.get(status_url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"status": "additional_information_requested"}


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_detail_redirect_to_forbidden_page(
    user_client, youth_application
):
    """
    Test that youth application detail endpoint using get redirects to forbidden page.
    """
    detail_url = reverse(
        "v1:youthapplication-detail", kwargs={"pk": youth_application.id}
    )
    response = user_client.get(detail_url)
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == handler_403_url()


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_detail_unallowed_methods(user_client, youth_application):
    """
    Test that youth application's detail endpoint doesn't allow HTTP methods delete,
    patch, post and put.
    """
    url = reverse("v1:youthapplication-detail", kwargs={"pk": youth_application.id})
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.post(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_activate_expired(
    user_client,
    inactive_youth_application,
    make_youth_application_activation_link_expired,
):
    """
    Test that youth application's activate endpoint redirects to expired page if the
    youth application has expired.
    """
    activate_url = reverse(
        "v1:youthapplication-activate", kwargs={"pk": inactive_youth_application.id}
    )
    response = user_client.get(activate_url)
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == inactive_youth_application.expired_page_url()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    EMAIL_HOST="",  # Use inexistent email host to ensure emails will never go anywhere
    NEXT_PUBLIC_DISABLE_VTJ=False,
    NEXT_PUBLIC_MOCK_FLAG=False,
)
@pytest.mark.django_db
def test_youth_application_activate_need_additional_info(
    user_client,
    make_youth_application_activation_link_unexpired,
):
    """
    Test that youth application's activate endpoint redirects to additional information
    page if additional information is required.
    """
    app = InactiveNeedAdditionalInfoYouthApplicationFactory()
    activate_url = reverse("v1:youthapplication-activate", kwargs={"pk": app.id})
    response = user_client.get(activate_url)
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == app.additional_info_page_url(pk=app.id)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    EMAIL_HOST="",  # Use inexistent email host to ensure emails will never go anywhere
    NEXT_PUBLIC_DISABLE_VTJ=False,
    NEXT_PUBLIC_MOCK_FLAG=False,
)
@pytest.mark.django_db
def test_youth_application_activate_automatically_acceptable(
    user_client,
    make_youth_application_activation_link_unexpired,
):
    """
    Test that youth application's activate endpoint redirects to accepted page if youth
    application is automatically accepted.
    """
    app = InactiveNoNeedAdditionalInfoYouthApplicationFactory()
    activate_url = reverse("v1:youthapplication-activate", kwargs={"pk": app.id})
    response = user_client.get(activate_url)
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == app.accepted_page_url()


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_process_redirect_to_forbidden_page(
    user_client, youth_application
):
    """
    Test that youth application process endpoint using get redirects to forbidden page.
    """
    process_url = reverse(
        "v1:youthapplication-process", kwargs={"pk": youth_application.id}
    )
    response = user_client.get(process_url)
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == handler_403_url()


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_process_unallowed_methods(user_client, youth_application):
    """
    Test that youth application's process endpoint doesn't allow HTTP methods delete,
    patch, post and put.
    """
    url = reverse("v1:youthapplication-process", kwargs={"pk": youth_application.id})
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.post(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_additional_info_unallowed_methods(
    user_client, youth_application
):
    """
    Test that youth application's additional info endpoint doesn't allow HTTP methods
    delete, get, patch and put.
    """
    url = reverse(
        "v1:youthapplication-additional-info", kwargs={"pk": youth_application.id}
    )
    assert user_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.get(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.patch(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert user_client.put(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_additional_info_empty_post(user_client):
    """
    Test that an empty post to youth application's additional info endpoint results in a
    bad request.
    """
    app = AdditionalInfoRequestedYouthApplicationFactory()
    url = reverse("v1:youthapplication-additional-info", kwargs={"pk": app.id})
    assert user_client.post(url).status_code == status.HTTP_400_BAD_REQUEST


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_additional_info_valid_post(user_client):
    """
    Test that a valid post to the additional info endpoint creates new additional
    information and returns the additional_info_user_reasons and
    additional_info_description fields but nothing else.
    """
    app = AdditionalInfoRequestedYouthApplicationFactory()
    additional_info_url = reverse(
        "v1:youthapplication-additional-info", kwargs={"pk": app.id}
    )
    post_data = {
        "additional_info_user_reasons": '["other"]',
        "additional_info_description": "Test description",
    }
    response = user_client.post(additional_info_url, data=post_data)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data == {
        "additional_info_user_reasons": ["other"],
        "additional_info_description": "Test description",
    }
