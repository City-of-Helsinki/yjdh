from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from stdnum.fi import hetu

from applications.models import Employee
from common.utils import PhoneNumberField
from helsinkibenefit.settings import MINIMUM_WORKING_HOURS_PER_WEEK


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Employee objects are meant to be edited together with their Application object.
    """

    phone_number = PhoneNumberField(
        allow_blank=True,
        help_text=(
            "Employee phone number normalized (start with zero, without country code)"
        ),
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "last_name",
            "social_security_number",
            "phone_number",
            "email",
            "employee_language",
            "job_title",
            "monthly_pay",
            "vacation_money",
            "other_expenses",
            "working_hours",
            "collective_bargaining_agreement",
            "is_living_in_helsinki",
            "commission_amount",
            "commission_description",
            "created_at",
            "birthday",
        ]
        read_only_fields = [
            "ordering",
            "birthday",
        ]

    def validate_social_security_number(self, value):
        if value == "":
            return value

        if not hetu.is_valid(value):
            raise serializers.ValidationError(_("Social security number invalid"))

        return value

    def validate_working_hours(self, value):
        if value and value < MINIMUM_WORKING_HOURS_PER_WEEK:
            raise serializers.ValidationError(
                format_lazy(
                    _("Working hour must be greater than {min_hour} per week"),
                    min_hour=MINIMUM_WORKING_HOURS_PER_WEEK,
                )
            )
        return value

    def validate_monthly_pay(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(_("Monthly pay must be greater than 0"))
        return value

    def validate_vacation_money(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                _("Vacation money must be a positive number")
            )
        return value

    def validate_other_expenses(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                _("Other expenses must be a positive number")
            )
        return value
