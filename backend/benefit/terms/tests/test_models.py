from datetime import date, timedelta

import pytest
from django.db import transaction
from django.db.utils import IntegrityError
from helsinkibenefit.tests.conftest import *  # noqa
from terms.enums import TermsType
from terms.models import Terms
from terms.tests.conftest import *  # noqa
from terms.tests.factories import TermsFactory


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


def test_terms_duplicate_effective_from():
    # terms_type, effective_from are unique together
    TermsFactory(effective_from=date.today(), terms_type=TermsType.APPLICANT_TERMS)
    with transaction.atomic():
        with pytest.raises(IntegrityError):
            TermsFactory(
                effective_from=date.today(), terms_type=TermsType.APPLICANT_TERMS
            )
    TermsFactory(effective_from=date.today(), terms_type=TermsType.TERMS_OF_SERVICE)


def test_current_terms(applicant_terms):
    # effective_from is None
    applicant_terms.effective_from = None
    applicant_terms.save()

    assert Terms.objects.get_terms_in_effect(TermsType.APPLICANT_TERMS) is None

    # effective_from is today
    applicant_terms.effective_from = date.today()
    applicant_terms.save()
    assert (
        Terms.objects.get_terms_in_effect(TermsType.APPLICANT_TERMS) == applicant_terms
    )

    # effective_from in future
    applicant_terms.effective_from = date.today() + timedelta(days=1)
    applicant_terms.save()
    assert Terms.objects.get_terms_in_effect(TermsType.APPLICANT_TERMS) is None

    # effective_from in past
    applicant_terms.effective_from = date.today() - timedelta(days=1)
    applicant_terms.save()
    assert (
        Terms.objects.get_terms_in_effect(TermsType.APPLICANT_TERMS) == applicant_terms
    )

    # Terms with more recent effective_from take precedence
    other_terms = TermsFactory(
        effective_from=date.today(), terms_type=TermsType.APPLICANT_TERMS
    )
    assert Terms.objects.get_terms_in_effect(TermsType.APPLICANT_TERMS) == other_terms

    # terms in future don't change the result
    TermsFactory(
        effective_from=date.today() + timedelta(days=1),
        terms_type=TermsType.APPLICANT_TERMS,
    )
    assert Terms.objects.get_terms_in_effect(TermsType.APPLICANT_TERMS) == other_terms

    # check that terms type matters
    other_terms.terms_type = TermsType.TERMS_OF_SERVICE
    other_terms.save()
    assert (
        Terms.objects.get_terms_in_effect(TermsType.APPLICANT_TERMS) == applicant_terms
    )
