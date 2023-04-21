from datetime import date

from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from applications.models import DeMinimisAid


class DeMinimisAidSerializer(serializers.ModelSerializer):
    """
    De minimis aid objects are meant to be edited together with their Application object.
    The "ordering" field is not editable and is ignored if present in POST/PUT data.
    The ordering of the DeMinimisAid objects is determined by their order in the "de_minimis_aid_set" list
    in the Application.
    """

    MAX_AID_AMOUNT = 200000
    amount = serializers.DecimalField(
        max_digits=DeMinimisAid.amount.field.max_digits,
        decimal_places=DeMinimisAid.amount.field.decimal_places,
        min_value=1,
        max_value=MAX_AID_AMOUNT,
        help_text="see MAX_AMOUNT",
    )

    def validate_granted_at(self, value):
        min_date = date(date.today().year - 4, 1, 1)
        if value < min_date:
            raise serializers.ValidationError(_("Grant date too much in past"))
        elif value > date.today():
            raise serializers.ValidationError(_("Grant date can not be in the future"))
        return value

    class Meta:
        model = DeMinimisAid
        fields = [
            "id",
            "granter",
            "granted_at",
            "amount",
            "ordering",
        ]
        read_only_fields = [
            "ordering",
        ]
        extra_kwargs = {
            "granter": {
                "help_text": "Granter of the benefit",
            },
            "granted_at": {
                "help_text": "Date max. four years into past",
            },
            "ordering": {
                "help_text": "Note: read-only field, ignored on input",
            },
        }
