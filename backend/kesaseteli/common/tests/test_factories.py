import pytest
from django.test import override_settings
from freezegun import freeze_time
from requests.exceptions import ReadTimeout

from applications.enums import VtjTestCase, YouthApplicationStatus
from applications.models import YouthApplication
from applications.tests.conftest import *  # noqa
from common.tests.factories import (
    AcceptableYouthApplicationFactory,
    AcceptedYouthApplicationFactory,
    ActiveUnhandledYouthApplicationFactory,
    ActiveYouthApplicationFactory,
    AdditionalInfoProvidedYouthApplicationFactory,
    AdditionalInfoRequestedYouthApplicationFactory,
    AwaitingManualProcessingYouthApplicationFactory,
    InactiveNeedAdditionalInfoYouthApplicationFactory,
    InactiveNoNeedAdditionalInfoYouthApplicationFactory,
    InactiveVtjTestCaseYouthApplicationFactory,
    InactiveYouthApplicationFactory,
    RejectableYouthApplicationFactory,
    RejectedYouthApplicationFactory,
    UnhandledYouthApplicationFactory,
    YouthApplicationFactory,
    YouthSummerVoucherFactory,
)


@freeze_time()
@override_settings(DISABLE_VTJ=False, NEXT_PUBLIC_MOCK_FLAG=True)
@pytest.mark.django_db
@pytest.mark.parametrize(
    "youth_application_factory,expected_statuses,expected_attribute_values",
    [
        (YouthApplicationFactory, YouthApplicationStatus.values, {}),
        (ActiveYouthApplicationFactory, YouthApplicationStatus.active_values(), {}),
        (
            InactiveYouthApplicationFactory,
            [YouthApplicationStatus.SUBMITTED.value],
            {},
        ),
        (
            AcceptableYouthApplicationFactory,
            YouthApplicationStatus.acceptable_values(),
            {},
        ),
        (
            AcceptedYouthApplicationFactory,
            [YouthApplicationStatus.ACCEPTED.value],
            {},
        ),
        (
            ActiveUnhandledYouthApplicationFactory,
            YouthApplicationStatus.active_unhandled_values(),
            {},
        ),
        (
            AdditionalInfoRequestedYouthApplicationFactory,
            [YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED.value],
            {"need_additional_info": True},
        ),
        (
            AdditionalInfoProvidedYouthApplicationFactory,
            [YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value],
            {"need_additional_info": True},
        ),
        (
            RejectableYouthApplicationFactory,
            YouthApplicationStatus.rejectable_values(),
            {},
        ),
        (
            RejectedYouthApplicationFactory,
            [YouthApplicationStatus.REJECTED.value],
            {},
        ),
        (
            UnhandledYouthApplicationFactory,
            YouthApplicationStatus.unhandled_values(),
            {},
        ),
        (
            AwaitingManualProcessingYouthApplicationFactory,
            [YouthApplicationStatus.AWAITING_MANUAL_PROCESSING.value],
            {},
        ),
        (
            InactiveNoNeedAdditionalInfoYouthApplicationFactory,
            [YouthApplicationStatus.SUBMITTED.value],
            {"need_additional_info": False},
        ),
        (
            InactiveNeedAdditionalInfoYouthApplicationFactory,
            [YouthApplicationStatus.SUBMITTED.value],
            {"need_additional_info": True},
        ),
        (
            InactiveVtjTestCaseYouthApplicationFactory,
            [YouthApplicationStatus.SUBMITTED.value],
            {},
        ),
    ],
)
def test_youth_application_factory(  # noqa: C901
    make_youth_application_activation_link_unexpired,
    youth_application_factory,
    expected_statuses,
    expected_attribute_values: dict,
):
    for _ in range(20):  # Run more than once because factories generate random data
        youth_application: YouthApplication = youth_application_factory()
        status = youth_application.status
        assert status in expected_statuses
        is_active_status = status in YouthApplicationStatus.active_values()
        is_handled_status = status in YouthApplicationStatus.handled_values()
        is_accepted_status = status == YouthApplicationStatus.ACCEPTED.value
        is_rejected_status = status == YouthApplicationStatus.REJECTED.value
        is_additional_information_requested_status = (
            status == YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED.value
        )
        assert youth_application.is_active == is_active_status
        assert youth_application.can_activate == (not is_active_status)
        assert youth_application.is_accepted == is_accepted_status
        assert youth_application.is_rejected == is_rejected_status
        assert (
            youth_application.can_set_additional_info
            == is_additional_information_requested_status
        )
        assert (youth_application.handler is not None) == is_handled_status
        assert (youth_application.handled_at is not None) == is_handled_status
        assert youth_application.has_youth_summer_voucher == is_accepted_status

        if status not in YouthApplicationStatus.can_have_additional_info_values():
            assert not youth_application.has_additional_info

        if status in YouthApplicationStatus.must_have_additional_info_values():
            assert youth_application.has_additional_info

        if status == YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED:
            assert youth_application.need_additional_info
            assert youth_application.can_set_additional_info
            assert not youth_application.has_additional_info
        elif status == YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED:
            assert youth_application.need_additional_info
            assert not youth_application.can_set_additional_info
            assert youth_application.has_additional_info

        # Test VTJ test cases
        if youth_application.is_vtj_test_case:
            vtj_test_case = youth_application.vtj_test_case

            if vtj_test_case == VtjTestCase.NO_ANSWER:
                with pytest.raises(ReadTimeout):
                    youth_application.encrypted_vtj_json = (
                        youth_application.fetch_vtj_json()
                    )
            else:
                youth_application.encrypted_vtj_json = (
                    youth_application.fetch_vtj_json()
                )

            if vtj_test_case == VtjTestCase.DEAD:
                assert youth_application.is_applicant_dead_according_to_vtj
            elif vtj_test_case == VtjTestCase.WRONG_LAST_NAME:
                assert not youth_application.is_last_name_as_in_vtj
            elif vtj_test_case == VtjTestCase.NOT_FOUND:
                assert (
                    not youth_application.is_social_security_number_valid_according_to_vtj
                )
            elif vtj_test_case == VtjTestCase.NO_ANSWER:
                assert youth_application.encrypted_vtj_json in [None, ""]
            elif vtj_test_case == VtjTestCase.HOME_MUNICIPALITY_HELSINKI:
                assert youth_application.vtj_home_municipality == "Helsinki"
                assert youth_application.is_helsinkian
            elif vtj_test_case == VtjTestCase.HOME_MUNICIPALITY_UTSJOKI:
                assert youth_application.vtj_home_municipality == "Utsjoki"
                assert not youth_application.is_helsinkian

        # If additional info has been provided it must have been initially needed
        if youth_application.has_additional_info:
            assert youth_application.need_additional_info

        # Test expected attribute values
        for attribute_name, expected_value in expected_attribute_values.items():
            assert hasattr(youth_application, attribute_name)
            assert getattr(youth_application, attribute_name) == expected_value


@pytest.mark.django_db
def test_youth_summer_voucher_factory():
    # Run more than once because factories generate random data
    youth_summer_vouchers = YouthSummerVoucherFactory.create_batch(size=20)

    for youth_summer_voucher in youth_summer_vouchers:
        assert youth_summer_voucher.summer_voucher_serial_number >= 1
        assert youth_summer_voucher.summer_voucher_exception_reason == ""

    summer_voucher_serial_numbers = [
        youth_summer_voucher.summer_voucher_serial_number
        for youth_summer_voucher in youth_summer_vouchers
    ]
    assert len(set(summer_voucher_serial_numbers)) == len(
        summer_voucher_serial_numbers
    ), "Duplicates in youth summer voucher serial numbers"

    youth_application_pks = [
        youth_summer_voucher.youth_application_id
        for youth_summer_voucher in youth_summer_vouchers
    ]
    assert len(set(youth_application_pks)) == len(
        youth_application_pks
    ), "Duplicates in youth application primary keys"
