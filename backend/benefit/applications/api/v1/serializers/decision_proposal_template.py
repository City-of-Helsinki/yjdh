from rest_framework import serializers

from applications.models import DecisionProposalTemplateSection


class DecisionProposalTemplateSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DecisionProposalTemplateSection
        fields = ["id", "name", "section_type", "template_text"]
