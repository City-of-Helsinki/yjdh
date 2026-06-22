import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from applications.models import Attachment
from common.tests.factories import AttachmentFactory, EmployerSummerVoucherFactory
from shared.common.tests.factories import (
    StaffSuperuserFactory,
    StaffUserFactory,
    UserFactory,
)


@pytest.mark.django_db
def test_attachment_inline_rendered(admin_client):
    # Create an employer summer voucher and an attachment for it
    voucher = EmployerSummerVoucherFactory()
    attachment = AttachmentFactory(summer_voucher=voucher)

    # Resolve URL for EmployerSummerVoucher change page
    url = reverse(
        "admin:applications_employersummervoucher_change",
        args=[voucher.pk],
    )

    response = admin_client.get(url)
    assert response.status_code == 200

    content = response.content.decode("utf-8")
    assert attachment.get_attachment_type_display() in content
    assert attachment.content_type in content

    # The download link should be visible in the inline
    download_url = reverse(
        "admin:applications_attachment_download", args=[attachment.pk]
    )
    assert download_url in content

    # The change page link to the attachment admin should be visible in the inline
    change_url = reverse("admin:applications_attachment_change", args=[attachment.pk])
    assert change_url in content


@pytest.mark.django_db
def test_attachment_admin_changelist_rendered(admin_client):
    # Create attachment
    voucher = EmployerSummerVoucherFactory()
    attachment = AttachmentFactory(summer_voucher=voucher)

    # Resolve URL for Attachment changelist view
    url = reverse("admin:applications_attachment_changelist")

    response = admin_client.get(url)
    assert response.status_code == 200

    content = response.content.decode("utf-8")
    # Verify the download link and properties are listed in changelist
    download_url = reverse(
        "admin:applications_attachment_download", args=[attachment.pk]
    )
    assert download_url in content
    assert attachment.get_attachment_type_display() in content


@pytest.mark.django_db
def test_download_attachment_as_staff_without_permission_denied(client):
    # Create attachment with mock file content
    voucher = EmployerSummerVoucherFactory()
    dummy_file = SimpleUploadedFile(
        "test_contract.pdf", b"pdf content", content_type="application/pdf"
    )
    attachment = AttachmentFactory(
        summer_voucher=voucher,
        attachment_file=dummy_file,
        content_type="application/pdf",
    )

    # Create a normal staff user (not superuser, lacks view_attachment permission)
    staff_user = StaffUserFactory()
    client.force_login(staff_user)

    url = reverse("admin:applications_attachment_download", args=[attachment.pk])
    response = client.get(url)

    assert response.status_code == 403


@pytest.mark.django_db
def test_download_attachment_as_staff_with_permission_allowed(client):
    # Create attachment with mock file content
    voucher = EmployerSummerVoucherFactory()
    dummy_file = SimpleUploadedFile(
        "test_contract.pdf", b"pdf content", content_type="application/pdf"
    )
    attachment = AttachmentFactory(
        summer_voucher=voucher,
        attachment_file=dummy_file,
        content_type="application/pdf",
    )

    # Create a normal staff user
    staff_user = StaffUserFactory()

    # Grant view_attachment permission
    from django.contrib.auth.models import Permission
    from django.contrib.contenttypes.models import ContentType

    content_type = ContentType.objects.get_for_model(Attachment)
    permission = Permission.objects.get(
        codename="view_attachment", content_type=content_type
    )
    staff_user.user_permissions.add(permission)

    client.force_login(staff_user)

    url = reverse("admin:applications_attachment_download", args=[attachment.pk])
    response = client.get(url)

    assert response.status_code == 200
    assert response.getvalue() == b"pdf content"
    assert response.headers["Content-Type"] == "application/pdf"
    assert "attachment; filename=" in response.headers["Content-Disposition"]


@pytest.mark.django_db
def test_download_attachment_as_superuser_allowed(client):
    # Create attachment with mock file content
    voucher = EmployerSummerVoucherFactory()
    dummy_file = SimpleUploadedFile(
        "test_contract.pdf", b"pdf content", content_type="application/pdf"
    )
    attachment = AttachmentFactory(
        summer_voucher=voucher,
        attachment_file=dummy_file,
        content_type="application/pdf",
    )

    # Superuser has all permissions implicitly
    superuser = StaffSuperuserFactory()
    client.force_login(superuser)

    url = reverse("admin:applications_attachment_download", args=[attachment.pk])
    response = client.get(url)

    assert response.status_code == 200
    assert response.getvalue() == b"pdf content"
    assert response.headers["Content-Type"] == "application/pdf"
    assert "attachment; filename=" in response.headers["Content-Disposition"]


@pytest.mark.django_db
def test_download_attachment_unauthenticated_denied(client):
    voucher = EmployerSummerVoucherFactory()
    attachment = AttachmentFactory(summer_voucher=voucher)
    url = reverse("admin:applications_attachment_download", args=[attachment.pk])

    # Try as unauthenticated user
    response = client.get(url)
    # self.admin_site.admin_view redirects unauthenticated users to admin login page
    assert response.status_code == 302
    assert "login" in response.url


@pytest.mark.django_db
def test_download_attachment_non_staff_denied(client):
    voucher = EmployerSummerVoucherFactory()
    attachment = AttachmentFactory(summer_voucher=voucher)
    url = reverse("admin:applications_attachment_download", args=[attachment.pk])

    # Try as a regular authenticated non-staff user
    regular_user = UserFactory()
    client.force_login(regular_user)

    response = client.get(url)
    # self.admin_site.admin_view redirects non-staff users
    assert response.status_code == 302


@pytest.mark.django_db
def test_delete_attachment_permissions(client):
    voucher = EmployerSummerVoucherFactory()
    attachment = AttachmentFactory(summer_voucher=voucher)

    # 1. Staff user (non-superuser) should NOT have delete permission
    staff_user = StaffUserFactory()
    client.force_login(staff_user)

    delete_url = reverse("admin:applications_attachment_delete", args=[attachment.pk])
    response = client.get(delete_url)
    # Non-superusers should be redirected or denied access
    assert response.status_code in [302, 403]

    # 2. Superuser should have delete permission (should load delete confirmation page)
    superuser = StaffSuperuserFactory()
    client.force_login(superuser)

    response = client.get(delete_url, HTTP_ACCEPT_LANGUAGE="en")
    assert response.status_code == 200
    assert "Delete" in response.content.decode("utf-8")


@pytest.mark.django_db
def test_add_change_attachment_permissions(client):
    # Create users
    staff_user = StaffUserFactory()
    superuser = StaffSuperuserFactory()

    # Resolve URLs
    add_url = reverse("admin:applications_attachment_add")

    # Staff user should not be able to load the add page
    client.force_login(staff_user)
    response = client.get(add_url)
    assert response.status_code in [302, 403]

    # Superuser should not be able to load the add page either since has_add_permission is False
    client.force_login(superuser)
    response = client.get(add_url)
    assert response.status_code in [302, 403]


@pytest.mark.django_db
def test_download_attachment_writes_audit_log(client):
    from auditlog.models import LogEntry
    from django.contrib.contenttypes.models import ContentType

    # Create attachment with mock file content
    voucher = EmployerSummerVoucherFactory()
    dummy_file = SimpleUploadedFile(
        "test_contract.pdf", b"pdf content", content_type="application/pdf"
    )
    attachment = AttachmentFactory(
        summer_voucher=voucher,
        attachment_file=dummy_file,
        content_type="application/pdf",
    )

    # Create a normal staff user
    staff_user = StaffUserFactory()

    # Grant view_attachment permission
    from django.contrib.auth.models import Permission

    content_type = ContentType.objects.get_for_model(Attachment)
    permission = Permission.objects.get(
        codename="view_attachment", content_type=content_type
    )
    staff_user.user_permissions.add(permission)

    client.force_login(staff_user)

    url = reverse("admin:applications_attachment_download", args=[attachment.pk])

    old_audit_log_entry_count = LogEntry.objects.count()
    response = client.get(url)
    assert response.status_code == 200

    assert LogEntry.objects.count() == old_audit_log_entry_count + 1
    audit_event = LogEntry.objects.filter(
        action=LogEntry.Action.ACCESS,
        content_type=content_type,
        object_pk=str(attachment.pk),
    ).first()

    assert audit_event is not None
    assert audit_event.actor_id == staff_user.pk
    assert audit_event.actor_email == staff_user.email
    assert audit_event.additional_data == {
        "is_sent": False,
        "method": "AttachmentAdmin.download_view",
        "request_path": url,
    }
