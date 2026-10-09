import uuid

import pytest
from django.test import override_settings
from django.urls import reverse
from rest_framework import status

from applications.enums import EmployerApplicationStatus
from common.tests.factories import (
    CompanyFactory,
    EmployerApplicationFactory,
    YouthApplicationFactory,
)
from common.tests.utils import set_company_business_id_to_client
from handler_notes.enums import NoteType
from handler_notes.tests.factories import NoteFactory
from shared.common.tests.conftest import force_login_user
from shared.common.tests.factories import UserFactory


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_employer_can_access_their_own_application_notes():
    company = CompanyFactory()
    user = UserFactory()
    client = force_login_user(user)
    set_company_business_id_to_client(company, client)

    application = EmployerApplicationFactory(
        company=company, user=user, status=EmployerApplicationStatus.SUBMITTED
    )
    note = NoteFactory(content_object=application, note_type=NoteType.EXTERNAL_MESSAGE)

    url = reverse("v1:handlernotes-external-messages", kwargs={"pk": application.pk})
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) > 0
    assert response.data[0]["id"] == str(note.id)


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_employer_cannot_access_other_company_application_notes():
    company1 = CompanyFactory()
    company2 = CompanyFactory()
    user1 = UserFactory()
    client1 = force_login_user(user1)
    set_company_business_id_to_client(company1, client1)

    application2 = EmployerApplicationFactory(
        company=company2, status=EmployerApplicationStatus.SUBMITTED
    )
    NoteFactory(content_object=application2, note_type=NoteType.EXTERNAL_MESSAGE)

    url = reverse("v1:handlernotes-external-messages", kwargs={"pk": application2.pk})
    response = client1.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_notes_with_different_content_type_are_filtered(staff_client):
    application = EmployerApplicationFactory(status=EmployerApplicationStatus.SUBMITTED)
    youth_application = YouthApplicationFactory()

    app_note = NoteFactory(
        content_object=application, note_type=NoteType.EXTERNAL_MESSAGE
    )
    youth_note = NoteFactory(
        content_object=youth_application, note_type=NoteType.EXTERNAL_MESSAGE
    )

    url = reverse("v1:handlernotes-external-messages", kwargs={"pk": application.pk})
    response = staff_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["id"] == str(app_note.id)
    assert not any(n["id"] == str(youth_note.id) for n in response.data)


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_invalid_pk_returns_permission_denied():
    company = CompanyFactory()
    user = UserFactory()
    client = force_login_user(user)
    set_company_business_id_to_client(company, client)

    # Test with a non-existent UUID
    url = reverse("v1:handlernotes-external-messages", kwargs={"pk": uuid.uuid4()})
    response = client.get(url)

    # IsEmployerOrHandler returns False if app not found, which leads to 403
    assert response.status_code == status.HTTP_403_FORBIDDEN
