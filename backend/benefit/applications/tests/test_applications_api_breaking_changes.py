from datetime import date

import pytest

from applications.api.v1.serializers import ApplicantApplicationSerializer
from applications.enums import BenefitType
from applications.tests.conftest import *  # noqa
from applications.tests.test_applications_api import get_detail_url
from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa


@pytest.mark.parametrize(
    "benefit_type,pay_subsidy_granted,pay_subsidy_percent,expected_benefit_type",
    [
        (BenefitType.SALARY_BENEFIT, True, 50, BenefitType.SALARY_BENEFIT),
        (BenefitType.EMPLOYMENT_BENEFIT, True, 50, ""),
        (BenefitType.EMPLOYMENT_BENEFIT, False, None, ""),
        (BenefitType.COMMISSION_BENEFIT, True, 50, ""),
    ],
)
def test_application_break_association_business_activities(
    api_client,
    association_application,
    benefit_type,
    pay_subsidy_granted,
    pay_subsidy_percent,
    expected_benefit_type,
):
    # test that setting association_has_business_activities to False works correctly
    association_application.benefit_type = benefit_type
    association_application.association_has_business_activities = True
    association_application.pay_subsidy_granted = pay_subsidy_granted
    association_application.pay_subsidy_percent = pay_subsidy_percent
    association_application.save()
    data = ApplicantApplicationSerializer(association_application).data

    data["association_has_business_activities"] = False

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    association_application.refresh_from_db()
    assert association_application.benefit_type == expected_benefit_type
    assert association_application.association_has_business_activities is False


def test_application_break_de_minimis_aid(api_client, association_application):
    association_application.benefit_type = BenefitType.SALARY_BENEFIT
    association_application.association_has_business_activities = True
    association_application.pay_subsidy_granted = True
    association_application.pay_subsidy_percent = 50
    association_application.de_minimis_aid = True
    association_application.save()
    association_application.de_minimis_aid_set.create(
        granter="sdf",
        amount=1000,
        granted_at=date.today(),
    )
    data = ApplicantApplicationSerializer(association_application).data

    data["association_has_business_activities"] = False

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    association_application.refresh_from_db()
    assert association_application.de_minimis_aid is None
    assert association_application.de_minimis_aid_set.count() == 0
    assert association_application.association_has_business_activities is False


def test_application_break_pay_subsidy_no_business_activities(
    api_client, association_application
):
    # test that setting pay_subsidy_granted to False works correctly
    # when association does not have business activities
    association_application.benefit_type = BenefitType.SALARY_BENEFIT
    association_application.association_has_business_activities = False
    association_application.pay_subsidy_granted = True
    association_application.pay_subsidy_percent = 50
    association_application.save()

    data = ApplicantApplicationSerializer(association_application).data

    data["pay_subsidy_granted"] = False
    data["pay_subsidy_percent"] = None

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    assert response.data["available_benefit_types"] == []

    association_application.refresh_from_db()
    assert association_application.benefit_type == ""
    assert association_application.association_has_business_activities is False
    assert association_application.pay_subsidy_granted is False


def test_application_break_pay_subsidy_with_business_activities(
    api_client, association_application
):
    # test that setting pay_subsidy_granted to False works correctly
    # when association has business activities
    association_application.benefit_type = BenefitType.SALARY_BENEFIT
    association_application.association_has_business_activities = True
    association_application.pay_subsidy_granted = True
    association_application.pay_subsidy_percent = 50
    association_application.de_minimis_aid = True
    association_application.save()
    association_application.de_minimis_aid_set.create(
        granter="sdf",
        amount=1000,
        granted_at=date.today(),
    )
    data = ApplicantApplicationSerializer(association_application).data

    data["pay_subsidy_granted"] = False
    data["pay_subsidy_percent"] = None
    data["apprenticeship_program"] = False

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    assert set(response.data["available_benefit_types"]) == {
        BenefitType.EMPLOYMENT_BENEFIT,
        BenefitType.COMMISSION_BENEFIT,
    }
    assert response.data["association_has_business_activities"] is True
    assert response.data["pay_subsidy_granted"] is False

    association_application.refresh_from_db()
    # assert no change done
    assert association_application.benefit_type == ""
    assert (
        association_application.de_minimis_aid_set.count() == 1
    )  # de minimis aid must not be cleared
    assert association_application.association_has_business_activities is True
    assert association_application.pay_subsidy_granted is False
