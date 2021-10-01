from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from terms.models import (
    ApplicantConsent,
    ApplicantTermsApproval,
    Terms,
    TermsOfServiceApproval,
)


class ApplicantConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicantConsent
        fields = [
            "id",
            "text_fi",
            "text_en",
            "text_sv",
        ]


class TermsSerializer(serializers.ModelSerializer):
    applicant_consents = ApplicantConsentSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Terms
        fields = [
            "id",
            "terms_type",
            "effective_from",
            "terms_pdf_fi",
            "terms_pdf_en",
            "terms_pdf_sv",
            "applicant_consents",
        ]


class ApplicantTermsApprovalSerializer(serializers.ModelSerializer):
    selected_applicant_consents = ApplicantConsentSerializer(
        many=True, help_text="Applicant consents that were selected"
    )
    terms = TermsSerializer(help_text="Terms that were approved")

    class Meta:
        model = ApplicantTermsApproval
        fields = [
            "id",
            "approved_at",
            "approved_by",
            "terms",
            "selected_applicant_consents",
            "application",
        ]
        read_only_fields = ["approved_at", "approved_by"]


class ApproveTermsSerializer(serializers.ModelSerializer):
    """
    Serializer used for approving the terms.
    * id, approved_at and approved_by fields are not included as they are assigned at the backend
    * application is not included as this serializer is only used in the context of ApplicationSerializer,
      and application is known when this serializer is used. Also, this enables use of this serializer
      for TermsType.TERMS_OF_SERVICE approval.
    * selected_applicant_consents is just a list of primary keys instead of the full serialized
      form of ApplicantConsent
    * also terms is just a primary key instead of the serialized format

    The Terms ID and ApplicantConsent IDs are explicitly sent in the request as an extra
    precaution, to ensure that the effective terms were shown and thta the user clicked all the required checkboxes.
    """

    selected_applicant_consents = serializers.PrimaryKeyRelatedField(
        many=True, queryset=ApplicantConsent.objects.all()
    )

    def validate(self, data):
        """
        Currently, all the applicant consents must be selected, none of them are optional.
        """
        if data["terms"] != Terms.objects.get_terms_in_effect(data["terms"].terms_type):
            # Extra validation step to ensure that the terms that have been shown to the user are actually the
            # terms that are currently in effect.
            raise serializers.ValidationError(
                {"terms": _("Only the terms currently in effect can be approved")}
            )

        if set(data["selected_applicant_consents"]) != set(
            data["terms"].applicant_consents.all()
        ):
            raise serializers.ValidationError(
                {
                    "selected_applicant_consents": _(
                        "User must explicitly select all the applicant consents required by the terms"
                    )
                }
            )
        return data

    class Meta:
        model = ApplicantTermsApproval
        fields = [
            "terms",
            "selected_applicant_consents",
        ]


class TermsOfServiceApprovalSerializer(serializers.ModelSerializer):
    selected_applicant_consents = ApplicantConsentSerializer(
        many=True, help_text="Applicant consents that were selected"
    )
    terms = TermsSerializer(help_text="Terms that were approved")

    class Meta:
        model = TermsOfServiceApproval
        fields = [
            "id",
            "approved_at",
            "approved_by",
            "terms",
            "selected_applicant_consents",
            "company",
            "user",
        ]
        read_only_fields = ["approved_at", "approved_by"]
