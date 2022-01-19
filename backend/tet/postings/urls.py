from django.conf import settings
from django.urls import path
from postings.views.linkedevents_views import CreateOrReadView, EditOrDeleteView

urlpatterns = []

if settings.NEXT_PUBLIC_MOCK_FLAG:
    from postings.views.mock_views import MockCreateOrReadView, MockEditOrDeleteView

    urlpatterns += [
        path("", MockCreateOrReadView.as_view()),
        path("<id>", MockEditOrDeleteView.as_view()),
    ]
else:
    urlpatterns += [
        path("", CreateOrReadView.as_view()),
        path("<id>", EditOrDeleteView.as_view()),
    ]
