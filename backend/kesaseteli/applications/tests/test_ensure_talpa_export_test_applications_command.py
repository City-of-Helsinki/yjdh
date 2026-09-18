from io import StringIO

import pytest
from django.core.management import call_command

from applications.enums import EmployerApplicationStatus
from applications.models import EmployerSummerVoucher
from common.tests.factories import EmployerSummerVoucherFactory


@pytest.mark.django_db
def test_command_creates_applications():
    out = StringIO()
    call_command("ensure_talpa_export_test_applications", count=5, stdout=out)
    assert "Created 5 test application(s)." in out.getvalue()
    assert EmployerSummerVoucher.objects.talpa_exportable().for_export().count() == 5


@pytest.mark.django_db
def test_command_no_op_when_at_target():
    for _ in range(5):
        EmployerSummerVoucherFactory(
            application__status=EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            is_exported=False,
            youth_summer_voucher__youth_application__youth_summer_voucher=None,
        )
    out = StringIO()
    call_command("ensure_talpa_export_test_applications", count=5, stdout=out)
    assert "Already at target count. Nothing created." in out.getvalue()
    assert EmployerSummerVoucher.objects.talpa_exportable().for_export().count() == 5


@pytest.mark.django_db
def test_command_respects_count_kwarg():
    out = StringIO()
    call_command("ensure_talpa_export_test_applications", count=3, stdout=out)
    assert "Created 3 test application(s)." in out.getvalue()
    assert EmployerSummerVoucher.objects.talpa_exportable().for_export().count() == 3


@pytest.mark.django_db
def test_command_cli_arg_syntax():
    out = StringIO()
    call_command("ensure_talpa_export_test_applications", "--count", "2", stdout=out)
    assert "Created 2 test application(s)." in out.getvalue()
    assert EmployerSummerVoucher.objects.talpa_exportable().for_export().count() == 2
