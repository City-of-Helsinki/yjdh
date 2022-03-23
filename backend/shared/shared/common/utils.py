import operator
from functools import reduce

from django.db.models import Q, QuerySet

_ALWAYS_FALSE_Q_FILTER = Q(pk=None)  # A hack but works as primary keys can't be null


def any_of_q_filter(**kwargs):
    """
    Return Q filters combined with | i.e. match any of the given keyword arguments.
    Return an always false Q filter if no keyword arguments are given.

    NOTE: Supports "not__" prefix to invert a particular Q expression i.e. ~Q().

    Example:
        any_of_q_filter(a=1, b__lt=2, not__c__gte=3)
        returns
            Q(a=1) | Q(b__lt=2) | ~Q(c__gte=3)

    :warning: Does not support field with name "not"
    :warning: Does not support multiple "not__" prefixes for a single field
    """
    if not kwargs:
        return _ALWAYS_FALSE_Q_FILTER
    return reduce(
        operator.or_,
        (
            ~Q(**{key[len("not__") :]: value})
            if key.startswith("not__")
            else Q(**{key: value})
            for key, value in kwargs.items()
        ),
    )


class MatchesAnyOfQuerySet(QuerySet):
    """
    QuerySet which supports OR filtering using matches_any_of member function.
    See matches_any_of function for details.

    NOTE: Put left in class declaration to have consistent method resolution order i.e.
          Test(MatchesAnyOfQuerySet, QuerySet) works
          but Test(QuerySet, MatchesAnyOfQuerySet) does not

    Example if TestClass used TestClassQuerySet(MatchesAnyOfQuerySet) as object manager:
        TestClass.objects.matches_any_of(a=1, b__lt=2, not__c__gte=3) would match like
            TestClass.objects.filter(Q(a=1) | Q(b__lt=2) | ~Q(c__gte=3))
    """

    def matches_any_of(self, **kwargs):
        """
        Do any of the given expressions match? If none match or there are no expressions
        then return an empty queryset. If there is some match then return the queryset
        with the objects that matched.

        NOTE: Supports "not__" prefix to invert a particular expression.

        Example:
            self.matches_any_of(a=1, b__lt=2, not__c__gte=3)
            returns
                self.filter(Q(a=1) | Q(b__lt=2) | ~Q(c__gte=3))

        :warning: Does not support field with name "not"
        :warning: Does not support multiple "not__" prefixes for a single field
        """
        return self.filter(any_of_q_filter(**kwargs))
