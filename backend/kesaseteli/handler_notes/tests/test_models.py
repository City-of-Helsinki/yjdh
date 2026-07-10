import pytest

from common.tests.factories import (
    AttachmentFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    YouthApplicationFactory,
)
from handler_notes.enums import NoteType
from handler_notes.models import Note
from handler_notes.tests.factories import NoteFactory


@pytest.mark.django_db
def test_note_creation():
    note = NoteFactory(content="Test note")
    assert Note.objects.count() == 1
    assert note.content == "Test note"
    assert note.note_type == NoteType.INTERNAL


@pytest.mark.django_db
def test_note_managers():
    NoteFactory.create_batch(3, note_type=NoteType.INTERNAL)
    NoteFactory.create_batch(2, note_type=NoteType.EXTERNAL_MESSAGE)

    assert Note.objects.internal_notes().count() == 3
    assert Note.objects.external_notes().count() == 2


@pytest.mark.django_db
def test_timeline_manager_youth_application():
    app = YouthApplicationFactory()
    NoteFactory(content_object=app)
    NoteFactory(content_object=app)

    # Another app's notes should not be included
    NoteFactory()

    timeline = Note.objects.for_application_timeline(app)
    assert timeline.count() == 2


@pytest.mark.django_db
def test_timeline_manager_employer_application_with_attachments():
    app = EmployerApplicationFactory()
    # An attachment is linked to an EmployerApplication through the EmployerSummerVoucher hierarchy.
    # We create notes targeting the application itself and notes targeting its child attachment.
    voucher = EmployerSummerVoucherFactory(application=app)
    attachment = AttachmentFactory(summer_voucher=voucher)

    NoteFactory(content_object=app)
    NoteFactory(content_object=attachment)

    timeline = Note.objects.for_application_timeline(app)
    assert timeline.count() == 2
