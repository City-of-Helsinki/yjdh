from datetime import timezone

import factory

from applications.enums import ApplicationStatus
from applications.tests.factories import ApplicationFactory
from companies.tests.factories import CompanyFactory
from shared.common.tests.factories import UserFactory
from terms.models import (
    AbstractTermsApproval,
    ApplicantConsent,
    ApplicantTermsApproval,
    Terms,
    TermsOfServiceApproval,
)


class ApplicantConsentFactory(factory.django.DjangoModelFactory):
    text_fi = factory.Faker("sentence", nb_words=3)
    text_en = factory.Faker("sentence", nb_words=3)
    text_sv = factory.Faker("sentence", nb_words=3)

    class Meta:
        model = ApplicantConsent


markdown_content = """# Heading 1

Lorem ipsum dolor sit amet"""


class TermsFactory(factory.django.DjangoModelFactory):
    terms_pdf_fi = "terms_fi.pdf"
    terms_pdf_en = "terms_en.pdf"
    terms_pdf_sv = "terms_sv.pdf"

    terms_md_fi = markdown_content
    terms_md_en = markdown_content
    terms_md_sv = markdown_content

    applicant_consent_1 = factory.RelatedFactory(
        ApplicantConsentFactory,
        factory_related_name="terms",
    )
    applicant_consent_2 = factory.RelatedFactory(
        ApplicantConsentFactory,
        factory_related_name="terms",
    )

    class Meta:
        model = Terms
        skip_postgeneration_save = True


class AbstractTermsApprovalFactory(factory.django.DjangoModelFactory):
    approved_at = factory.Faker("date_time", tzinfo=timezone.utc)
    approved_by = factory.SubFactory(UserFactory)
    terms = factory.SubFactory(TermsFactory)

    @factory.post_generation
    def selected_applicant_consents(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            for _ in range(3):
                self.selected_applicant_consents.add(ApplicantConsentFactory())
            return

        if extracted:
            # A list of groups were passed in, use them
            for consent in extracted:
                self.selected_applicant_consents.add(consent)

    class Meta:
        model = AbstractTermsApproval
        abstract = True
        skip_postgeneration_save = True


class ApplicantTermsApprovalFactory(AbstractTermsApprovalFactory):
    class Meta:
        model = ApplicantTermsApproval

    application = factory.SubFactory(
        ApplicationFactory, status=ApplicationStatus.RECEIVED
    )


class TermsOfServiceApprovalFactory(AbstractTermsApprovalFactory):
    class Meta:
        model = TermsOfServiceApproval

    user = factory.SubFactory(UserFactory)
    company = factory.SubFactory(CompanyFactory)
