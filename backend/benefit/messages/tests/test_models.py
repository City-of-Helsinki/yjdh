import pytest

from messages.models import Message
from messages.tests.factories import MessageFactory


@pytest.mark.django_db
def test_message_model():
    msg = MessageFactory()
    assert Message.objects.count() == 1
    assert msg.application
    assert msg.sender
