import re
from datetime import datetime
from typing import Union

from dateutil.relativedelta import relativedelta
from django.contrib.postgres.search import (
    SearchQuery,
    SearchRank,
    SearchVector,
    TrigramSimilarity,
)
from django.db import models
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from fuzzywuzzy import fuzz
from rest_framework import filters as drf_filters
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.application import (
    ArchivalApplicationListSerializer,
    HandlerApplicationListSerializer,
)
from applications.enums import ApplicationStatus
from applications.models import Application, ArchivalApplication
from common.permissions import BFIsHandler


class SearchPattern(models.TextChoices):
    AHJO = "ahjo", _("Ahjo")
    ALL = "all", _("All")
    COMPANY = "company", _("Company")
    IN_MEMORY = "in-memory", _("In-memory")
    NUMBERS = "numbers", _("Numbers")
    SSN = "ssn", _("SSN")
    ARCHIVAL = "archived_application", _("Archival application")


class SubsidyInEffect(models.TextChoices):
    NOW = "now", _("Now")


class SearchView(APIView):
    permission_classes = [BFIsHandler]
    filter_backends = [
        drf_filters.OrderingFilter,
        drf_filters.SearchFilter,
    ]

    def get(self, request):
        search_string = (
            request.query_params.get("q", "").strip() if "q" in request.GET else None
        )
        if search_string is None:
            return Response(
                {"error": _("Search query 'q' is required")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        archived = request.query_params.get("archived") == "1" or False
        search_from_archival = request.query_params.get("archival") == "1" or False
        application_number = request.query_params.get("app_no")
        load_all = request.query_params.get("load_all") == "1" or False

        subsidy_in_effect = request.query_params.get("subsidy_in_effect")

        years_since_decision = None
        if request.query_params.get("years_since_decision"):
            years_since_decision = int(request.query_params.get("years_since_decision"))

        filters = _detect_filters(search_string)
        in_memory_filter_str = filters["in_memory_filter_str"]
        search_string = filters["search_string"]
        detected_pattern = filters["detected_pattern"]

        # Archival application number starts with R or Y followed by numbers
        if re.search("^[RY]\\d+", search_string, re.I):
            detected_pattern = SearchPattern.ARCHIVAL
        # Ahjo case id starts with HEL and is followed by numbers
        elif re.search("^HEL\\s\\d+", search_string, re.I):
            detected_pattern = SearchPattern.AHJO
        # Social security number is 6 digits followed by a separator and 3 digits
        elif re.search("^\\d{6}([-+a-z])\\d{3}\\w", search_string, re.I):
            detected_pattern = SearchPattern.SSN
        # Other numbers assumed as application number or company business id
        elif re.search("^\\d+", search_string):
            detected_pattern = SearchPattern.NUMBERS

        application_queryset = _prepare_application_queryset(
            archived, subsidy_in_effect, years_since_decision
        )

        archival_application_queryset = _prepare_archival_application_queryset(
            subsidy_in_effect, years_since_decision
        )

        return search_applications(
            application_queryset,
            archival_application_queryset,
            search_string,
            in_memory_filter_str,
            detected_pattern,
            application_number,
            search_from_archival,
            load_all,
        )


def _prepare_application_queryset(archived, subsidy_in_effect, years_since_decision):
    queryset = Application.objects.filter(archived=archived)

    if subsidy_in_effect and subsidy_in_effect == SubsidyInEffect.NOW:
        queryset = queryset.filter(
            status=ApplicationStatus.ACCEPTED,
            calculation__start_date__lte=datetime.now(),
            calculation__end_date__gte=datetime.now(),
        )
    elif subsidy_in_effect and subsidy_in_effect.isnumeric():
        queryset = queryset.filter(
            status=ApplicationStatus.ACCEPTED,
            calculation__end_date__gte=datetime.now().date()
            - relativedelta(years=int(subsidy_in_effect)),
        )
    if years_since_decision:
        queryset = queryset.filter(
            Q(
                status=ApplicationStatus.ACCEPTED,
                batch__isnull=False,
                batch__decision_date__gte=datetime.now()
                - relativedelta(years=years_since_decision),
            )
            | Q(
                status=ApplicationStatus.REJECTED,
                handled_at__gte=datetime.now()
                - relativedelta(years=years_since_decision),
            ),
        )
    return queryset.order_by("-modified_at")


def _prepare_archival_application_queryset(subsidy_in_effect, years_since_decision):
    queryset = ArchivalApplication.objects
    if subsidy_in_effect and subsidy_in_effect == SubsidyInEffect.NOW:
        return queryset.filter(
            start_date__lte=datetime.now(),
            end_date__gte=datetime.now(),
        )
    elif subsidy_in_effect:
        return queryset.filter(
            end_date__gte=datetime.now().date()
            - relativedelta(years=int(subsidy_in_effect))
        )
    elif years_since_decision:
        return queryset.filter(
            end_date__gte=datetime.now().date()
            - relativedelta(years=int(years_since_decision))
        )
    return queryset.all()


def search_applications(
    application_queryset,
    archival_application_queryset,
    search_string,
    in_memory_filter_string,
    detected_pattern,
    application_number=None,
    search_from_archival=False,
    load_all=False,
) -> Response:
    if application_number:
        querysets = _query_by_application_number(
            application_queryset, archival_application_queryset, application_number
        )
        application_queryset = querysets["application_queryset"]
        archival_application_queryset = querysets["archival_application_queryset"]

    if search_string == "" and in_memory_filter_string == "":
        return _query_and_respond_to_empty_search(
            application_queryset, archival_application_queryset, load_all
        )

    # Return early in case of number-like pattern
    if detected_pattern in [SearchPattern.AHJO, SearchPattern.NUMBERS]:
        return _query_and_respond_to_numbers(
            application_queryset,
            archival_application_queryset,
            search_string,
            detected_pattern,
        )
    elif detected_pattern == SearchPattern.SSN:
        return _query_and_respond_to_ssn(
            application_queryset, search_string, detected_pattern
        )
    elif detected_pattern == SearchPattern.ARCHIVAL:
        return _query_and_respond_to_archival_application(
            archival_application_queryset, search_string, detected_pattern
        )

    # Perform trigram query for company name
    if detected_pattern in [SearchPattern.COMPANY, SearchPattern.IN_MEMORY]:
        results_for_related_company = _query_for_company_name(
            application_queryset, archival_application_queryset, search_string
        )
        applications = results_for_related_company["applications"]
        archival_applications = results_for_related_company["archival"]

    applications = HandlerApplicationListSerializer(applications, many=True).data

    filtered_data = []
    in_memory_results = None

    # Use filter string to perform in-memory search
    if (
        detected_pattern in [SearchPattern.COMPANY, SearchPattern.IN_MEMORY]
        and in_memory_filter_string != ""
    ):
        in_memory_results = _perform_in_memory_search(
            applications,
            detected_pattern,
            application_queryset,
            search_string,
            in_memory_filter_string,
            HandlerApplicationListSerializer,
        )
        filtered_data = in_memory_results["data"]

        archival_data = ArchivalApplicationListSerializer(
            archival_applications, many=True
        ).data
        in_memory_results_archival = _perform_in_memory_search(
            archival_data,
            detected_pattern,
            archival_application_queryset,
            search_string,
            in_memory_filter_string,
            ArchivalApplicationListSerializer,
        )
        filtered_data += in_memory_results_archival["data"]

        detected_pattern = in_memory_results["detected_pattern"]
    else:
        filtered_data = applications
        if search_from_archival:
            filtered_data += ArchivalApplicationListSerializer(
                archival_applications, many=True
            ).data

    return _create_search_response(
        None,
        filtered_data,
        detected_pattern,
        search_string,
        in_memory_results,
        in_memory_filter_string,
    )


def _fuzzy_matching(applications, query, threshold):
    """Advanced fuzzy matching for all possible combinations of first/lastname orders"""

    scores = []
    for index, app in enumerate(applications):
        ratios = [
            fuzz.ratio(str(query), str(value))
            for value in _get_filter_combinations(app)
        ]
        scores.append({"index": index, "score": max(ratios)})

    filtered_scores = [item for item in scores if item["score"] >= threshold]
    sorted_filtered_scores = sorted(
        filtered_scores, key=lambda k: k["score"], reverse=True
    )

    filtered_list_of_dicts = [
        applications[item["index"]] for item in sorted_filtered_scores
    ]
    return {"data": filtered_list_of_dicts, "scores": sorted_filtered_scores}


def _contains_matching(
    applications,
    query,
):
    """Simple substring matching for all possible combinations of first/lastname orders,
    used as fallback for fuzzy matching"""
    results = []
    for app in applications:
        for value in _get_filter_combinations(app):
            if query in value.lower():
                results.append(app)
                break
    return {"data": results, "scores": None}


def _get_filter_combinations(app):
    """Return all possible combinations of first/lastname orders for matching"""
    return [
        (app["employee"]["first_name"] + " " + app["employee"]["last_name"]).lower(),
        (app["employee"]["last_name"] + " " + app["employee"]["first_name"]).lower(),
        app["employee"]["first_name"].lower(),
        app["employee"]["last_name"].lower(),
    ]


def _query_by_application_number(
    application_queryset, archival_application_queryset, application_number
):
    app = Application.objects.filter(application_number=application_number).first()

    # Get year of birth from SSN, assume no-one is seeking for a job before 1900's
    year_suffix = app.employee.social_security_number[4:6]
    ssn_separator = app.employee.social_security_number[6:7]
    ssn_separators_born_in_2000s = ["A", "B", "C", "D", "E", "F"]
    year_prefix = 20 if ssn_separator in ssn_separators_born_in_2000s else 19

    return {
        "application_queryset": application_queryset.filter(
            employee__social_security_number=app.employee.social_security_number,
            company__business_id=app.company.business_id,
        ),
        "archival_application_queryset": archival_application_queryset.filter(
            Q(
                employee_first_name=app.employee.first_name,
                employee_last_name=app.employee.last_name,
            )
            & (
                Q(year_of_birth=f"{year_prefix}{year_suffix}")
                | Q(
                    year_of_birth="1900"
                )  # A few ArchivalApplication do not have birth year and is marked as 1900
            ),
        ),
    }


def _query_and_respond_to_empty_search(
    application_queryset, archival_application_queryset, load_all
):
    data = []
    if load_all:
        data += HandlerApplicationListSerializer(application_queryset, many=True).data
        data += ArchivalApplicationListSerializer(
            archival_application_queryset, many=True
        ).data
    else:
        data += HandlerApplicationListSerializer(
            application_queryset[:30], many=True
        ).data
        data += ArchivalApplicationListSerializer(
            archival_application_queryset[:30], many=True
        ).data
    return _create_search_response(None, data, SearchPattern.ALL, "")


def _query_and_respond_to_ssn(
    application_queryset,
    search_query_string,
    detected_pattern,
):
    """
    Because of limitation in django-searchable-encrypted-fields,
    filter by exact SSN and if no match is found then try uppercase
    """
    application_queryset = application_queryset.filter(
        employee__social_security_number=search_query_string
    )
    if application_queryset.count() == 0:
        application_queryset = application_queryset.filter(
            employee__social_security_number=search_query_string.upper()
        )
    return _create_search_response(
        application_queryset,
        None,
        detected_pattern,
        search_query_string,
    )


def _query_and_respond_to_archival_application(
    archival_application_queryset, search_query_string, detected_pattern
):
    archival_application_queryset = archival_application_queryset.filter(
        Q(application_number__icontains=search_query_string)
    )
    return _create_search_response(
        queryset=archival_application_queryset,
        serialized_data=None,
        detected_pattern=detected_pattern,
        search_query_str=search_query_string,
        serializer=ArchivalApplicationListSerializer,
    )


def _query_and_respond_to_numbers(
    application_queryset,
    archival_application_queryset,
    search_query_str,
    detected_pattern,
):
    """
    Perform simple LIKE query for application number, AHJO case ID and company business ID
    """
    applications = application_queryset.filter(
        Q(company__business_id__icontains=search_query_str)
        | Q(ahjo_case_id__icontains=search_query_str)
        | Q(application_number__icontains=search_query_str)
    )
    data = HandlerApplicationListSerializer(applications, many=True).data

    archival_applications = archival_application_queryset.filter(
        company__business_id__icontains=search_query_str
    )
    data += ArchivalApplicationListSerializer(archival_applications, many=True).data

    return _create_search_response(
        queryset=None,
        serialized_data=data,
        detected_pattern=detected_pattern,
        search_query_str=search_query_str,
    )


def _create_search_response(
    queryset: Union[Application, None],
    serialized_data: Union[list, None],
    detected_pattern: str,
    search_query_str: str,
    in_memory_results: Union[dict, None] = None,
    in_memory_filter_str="",
    serializer=HandlerApplicationListSerializer,
):
    if serialized_data is None:
        serialized_data = serializer(queryset, many=True).data

    return Response(
        {
            "q": search_query_str,
            "matches": serialized_data,
            "filter": in_memory_filter_str,
            "detected_pattern": detected_pattern,
            "count": len(serialized_data),
            "score": in_memory_results["scores"] if in_memory_results else None,
        },
        status=status.HTTP_200_OK,
    )


def _perform_in_memory_search(
    data,
    detected_pattern,
    queryset,
    search_string,
    in_memory_filter_str,
    serializer,
):
    """Perform more expensive in-memory search from within applications"""
    if detected_pattern == SearchPattern.COMPANY:
        in_memory_filter_str = search_string
    # No previous search results, use all applications as haystack
    if len(data) == 0 or search_string == "":
        data = serializer(queryset, many=True).data
        detected_pattern = f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}"
    else:
        detected_pattern = f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}"

    # Try fuzzy matching with high threshold. If zero matches, try lower score and
    # finally try substring matching
    in_memory_results = _fuzzy_matching(data, in_memory_filter_str, 80)
    if not in_memory_results["data"]:
        in_memory_results = _fuzzy_matching(data, in_memory_filter_str, 70)
    if not in_memory_results["data"]:
        in_memory_results = _contains_matching(
            data,
            in_memory_filter_str,
        )
        detected_pattern += "-fallback"

    return {**in_memory_results, "detected_pattern": detected_pattern}


def _query_for_company_name(
    application_queryset, archival_application_queryset, search_string
):
    search_vectors = SearchVector("company__name")
    query = SearchQuery(search_string, search_type="websearch")

    return {
        "applications": (
            application_queryset.annotate(
                search=search_vectors,
                similarity=TrigramSimilarity("company__name", search_string),
                rank=SearchRank(search_vectors, query),
            )
            .filter(similarity__gt=0.3)
            .order_by("-similarity", "-handled_at")
        ),
        "archival": (
            archival_application_queryset.annotate(
                search=search_vectors,
                similarity=TrigramSimilarity("company__name", search_string),
                rank=SearchRank(search_vectors, query),
            )
            .filter(similarity__gt=0.3)
            .order_by("-similarity", "-handled_at")
        ),
    }


def _detect_filters(search_string):
    """Detect filters from search query
    # TODO: only single pattern is supported at the moment
    """
    in_memory_patterns = ["nimi:"]
    in_memory_filter_str = ""
    detected_pattern = SearchPattern.COMPANY

    for pattern in in_memory_patterns:
        if re.search(pattern, search_string):
            in_memory_filter_str = (
                re.sub("(.*)?\\s?" + pattern + "(.*)", "\\g<2>", search_string)
                .lower()
                .strip()
            )
            search_string = re.sub(
                "\\s?" + pattern + "(.*)+", "", search_string
            ).strip()
            detected_pattern = SearchPattern.IN_MEMORY

    return {
        "detected_pattern": detected_pattern,
        "search_string": search_string,
        "in_memory_filter_str": in_memory_filter_str,
    }
