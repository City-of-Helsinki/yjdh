import re
from typing import Union

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
from rest_framework import filters as drf_filters, status
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.application import HandlerApplicationListSerializer
from applications.models import Application
from common.permissions import BFIsHandler


class SearchPattern(models.TextChoices):
    AHJO = "ahjo", _("Ahjo")
    ALL = "all", _("All")
    COMPANY = "company", _("Company")
    IN_MEMORY = "in-memory", _("In-memory")
    NUMBERS = "numbers", _("Numbers")
    SSN = "ssn", _("SSN")


class SearchView(APIView):
    permission_classes = [BFIsHandler]
    filter_backends = [
        drf_filters.OrderingFilter,
        drf_filters.SearchFilter,
    ]

    def get(self, request):
        applications = []
        search_string = (
            request.query_params.get("q", "").strip() if "q" in request.GET else None
        )
        archived = request.query_params.get("archived") == "1" or False

        if search_string is None:
            return Response(
                {"error": _("Search query 'q' is required")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        filters = _detect_filters(search_string)
        in_memory_filter_str = filters["in_memory_filter_str"]
        search_string = filters["search_string"]
        detected_pattern = filters["detected_pattern"]

        if re.search("^HEL\\s\\d+", search_string, re.I):
            detected_pattern = SearchPattern.AHJO
        elif re.search("^\\d{6}([-+a-z])\\d{3}\\w", search_string, re.I):
            detected_pattern = SearchPattern.SSN
        elif re.search("^\\d+", search_string):
            detected_pattern = SearchPattern.NUMBERS

        if detected_pattern in [SearchPattern.AHJO, SearchPattern.NUMBERS]:
            return _query_and_respond_to_numbers(search_string, detected_pattern)
        elif detected_pattern == SearchPattern.SSN:
            return _query_and_respond_to_ssn(
                search_string,
                detected_pattern,
            )
        # Perform trigram query for company name
        elif detected_pattern in [SearchPattern.COMPANY, SearchPattern.IN_MEMORY]:
            applications = _query_for_company(archived, search_string)

        data = HandlerApplicationListSerializer(applications, many=True).data
        in_memory_results = None

        # Use filter string to perform in-memory search
        if (
            detected_pattern in [SearchPattern.COMPANY, SearchPattern.IN_MEMORY]
            and in_memory_filter_str != ""
        ):
            in_memory_results = _perform_in_memory_search(
                data,
                detected_pattern,
                archived,
                search_string,
                in_memory_filter_str,
            )
            data = in_memory_results["data"]
            detected_pattern = in_memory_results["detected_pattern"]

        return _create_search_response(
            None,
            data,
            detected_pattern,
            search_string,
            in_memory_results,
            in_memory_filter_str,
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


def _query_and_respond_to_ssn(search_query_str, detected_pattern):
    """
    Because of limitation in django-searchable-encrypted-fields,
    filter by exact SSN and if no match is found then try uppercase
    """
    applications = Application.objects.filter(
        employee__social_security_number=search_query_str
    )
    if applications.count() == 0:
        applications = Application.objects.filter(
            employee__social_security_number=search_query_str.upper()
        )
    return _create_search_response(
        applications,
        None,
        detected_pattern,
        search_query_str,
    )


def _query_and_respond_to_numbers(search_query_str, detected_pattern):
    """
    Perform simple LIKE query for application number, AHJO case ID and company business ID
    """
    applications = Application.objects.filter(
        Q(company__business_id__icontains=search_query_str)
        | Q(ahjo_case_id__icontains=search_query_str)
        | Q(application_number__icontains=search_query_str)
    )
    return _create_search_response(
        applications,
        None,
        detected_pattern,
        search_query_str,
    )


def _create_search_response(
    applications: Union[Application, None],
    serialized_data: Union[list, None],
    detected_pattern: str,
    search_query_str: str,
    in_memory_results: Union[dict, None] = None,
    in_memory_filter_str="",
):
    if serialized_data is None:
        serialized_data = HandlerApplicationListSerializer(applications, many=True).data

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
    data, detected_pattern, archived, search_string, in_memory_filter_str
):
    """Perform more expensive in-memory search from within applications"""
    if detected_pattern == SearchPattern.COMPANY:
        in_memory_filter_str = search_string

    # No previous search results, use all applications as haystack
    if len(data) == 0 or search_string == "":
        applications = Application.objects.filter(archived=archived)
        data = HandlerApplicationListSerializer(applications, many=True).data
        detected_pattern = f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}"
    else:
        detected_pattern = f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}"

    # Try fuzzy matching with high threshold. If zero matches, try lower score and finally try substring matching
    in_memory_results = _fuzzy_matching(data, in_memory_filter_str, 80)
    if not in_memory_results["data"]:
        in_memory_results = _fuzzy_matching(data, in_memory_filter_str, 70)
    if not in_memory_results["data"]:
        in_memory_results = _contains_matching(
            data,
            in_memory_filter_str,
        )
        detected_pattern += "-fallback"

    return {**in_memory_results, **{"detected_pattern": detected_pattern}}


def _query_for_company(archived, search_string):
    search_vectors = SearchVector("company__name")
    query = SearchQuery(search_string, search_type="websearch")

    return (
        Application.objects.filter(archived=archived)
        .annotate(
            search=search_vectors,
            similarity=TrigramSimilarity("company__name", search_string),
            rank=SearchRank(search_vectors, query),
        )
        .filter(similarity__gt=0.3)
        .order_by("-similarity", "-handled_at")
    )


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
