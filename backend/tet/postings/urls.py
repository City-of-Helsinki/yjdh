from django.conf import settings
from django.urls import path

urlpatterns = []

if settings.NEXT_PUBLIC_MOCK_FLAG:
    from postings.views.mock_views import MockCreateOrReadView, EditOrDeleteView

    urlpatterns += [
        path("", MockCreateOrReadView.as_view()),
        path("<id>", EditOrDeleteView.as_view()),
    ]
else:
    pass  # TODO import from postings.views.linkedeventsviews
