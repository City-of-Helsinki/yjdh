import factory
from applications.enums import ApplicationStatus
from applications.tests.factories import ApplicationFactory
from companies.tests.factories import CompanyFactory
from terms.models import (
    AbstractTermsApproval,
    ApplicantConsent,
    ApplicantTermsApproval,
    Terms,
    TermsOfServiceApproval,
)
from users.tests.factories import UserFactory


class ApplicantConsentFactory(factory.django.DjangoModelFactory):
    text_fi = factory.Faker("sentence", nb_words=3)
    text_en = factory.Faker("sentence", nb_words=3)
    text_sv = factory.Faker("sentence", nb_words=3)

    class Meta:
        model = ApplicantConsent


class TermsFactory(factory.django.DjangoModelFactory):
    terms_pdf_fi = factory.django.FileField(filename="terms_fi.pdf")
    terms_pdf_en = factory.django.FileField(filename="terms_en.pdf")
    terms_pdf_sv = factory.django.FileField(filename="terms_sv.pdf")

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


class AbstractTermsApprovalFactory(factory.django.DjangoModelFactory):
    approved_at = factory.Faker("date_time")
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
