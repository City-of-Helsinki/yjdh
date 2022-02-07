import re
from datetime import date, datetime, timedelta
from typing import Dict, List

import filetype

from applications.api.v1.serializers import EmployeeSerializer, HandlerApplicationSerializer
from applications.api.v1.status_transition_validator import (
    ApplicantApplicationStatusValidator,
    ApplicationBatchStatusValidator,
    HandlerApplicationStatusValidator,
)
from applications.benefit_aggregation import get_former_benefit_info
from applications.enums import (
    ApplicationBatchStatus,
    ApplicationStatus,
    AttachmentRequirement,
    AttachmentType,
    BenefitType,
    OrganizationType,
)
from applications.models import (
    Application,
    ApplicationBasis,
    ApplicationBatch,
    ApplicationLogEntry,
    Attachment,
    DeMinimisAid,
    Employee,
)
from calculator.api.v1.serializers import (
    CalculationSerializer,
    PaySubsidySerializer,
    TrainingCompensationSerializer,
)
from calculator.models import Calculation
from common.delay_call import call_now_or_later, do_delayed_calls_at_end
from common.exceptions import BenefitAPIException
from common.utils import (
    get_date_range_end_with_days360,
    PhoneNumberField,
    to_decimal,
    update_object,
    xgroup, RedactedField,
)
from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import transaction
from django.forms import ImageField, ValidationError as DjangoFormsValidationError
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema_field
from helsinkibenefit.settings import MAX_UPLOAD_SIZE, MINIMUM_WORKING_HOURS_PER_WEEK
from messages.automatic_messages import send_application_reopened_message
from rest_framework import serializers
from rest_framework.fields import FileField
from rest_framework.reverse import reverse
from terms.api.v1.serializers import (
    ApplicantTermsApprovalSerializer,
    ApproveTermsSerializer,
    TermsSerializer,
)
from terms.enums import TermsType
from terms.models import ApplicantTermsApproval, Terms
from users.utils import get_company_from_request, get_request_user_from_context




class EmployeeReportSerializer(EmployeeSerializer):
    class Meta(EmployeeSerializer.Meta):
        fields = [f for f in EmployeeSerializer.Meta.fields if f != 'social_security_number']


class ApplicationReportSerializer(HandlerApplicationSerializer):
    """
    Serializer for CSV and other reporting.
    In future, the JSON formatted output can be used for integration with external reporting systems.
    """


    #class Meta(BaseApplicationSerializer.Meta):
    #    fields = BaseApplicationSerializer.Meta.fields
