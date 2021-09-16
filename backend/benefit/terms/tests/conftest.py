import pytest
from common.tests.conftest import *  # noqa
from terms.enums import TermsType
from terms.tests.factories import (
    ApplicantConsentFactory,
    ApplicantTermsApprovalFactory,
    TermsFactory,
)


@pytest.fixture
def applicant_consent():
    return ApplicantConsentFactory()


@pytest.fixture
def applicant_terms():
    return TermsFactory(terms_type=TermsType.APPLICANT_TERMS)


@pytest.fixture
def applicant_terms_approval():
    return ApplicantTermsApprovalFactory()
