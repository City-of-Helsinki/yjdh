from datetime import date, timedelta

from helsinkibenefit.tests.conftest import *  # noqa
from terms.models import Terms
from terms.tests.conftest import *  # noqa


def test_terms_model(applicant_terms):
    assert Terms.objects.count() == 1
    assert applicant_terms.applicant_consents.count() == 2
    assert applicant_terms.terms_pdf_fi is not None


def test_terms_editable(applicant_terms):
    applicant_terms.effective_from = None
    assert applicant_terms.is_editable
    applicant_terms.effective_from = date.today()
    assert not applicant_terms.is_editable
    applicant_terms.effective_from = date.today() + timedelta(days=1)
    assert applicant_terms.is_editable
    applicant_terms.effective_from = date.today() - timedelta(days=1)
    assert not applicant_terms.is_editable


def test_applicant_terms_approval(applicant_terms_approval):
    assert applicant_terms_approval.terms is not None
    assert applicant_terms_approval.terms.applicant_consents.count() == 2
    assert applicant_terms_approval.terms is not None
    assert applicant_terms_approval.terms is not None
