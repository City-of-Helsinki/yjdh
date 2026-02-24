import factory
import pytest
from django.contrib.admin.sites import AdminSite

from applications.admin import IsValidSchoolFilter, SchoolFilter, YouthApplicationAdmin
from applications.models import School, YouthApplication
from common.tests.factories import YouthApplicationFactory


class SchoolFactory(factory.django.DjangoModelFactory):
    name = factory.Faker("company")

    class Meta:
        model = School


@pytest.fixture
def youth_application_admin():
    return YouthApplicationAdmin(YouthApplication, AdminSite())


@pytest.mark.django_db
def test_is_valid_school(youth_application_admin):
    # Test with valid school
    SchoolFactory(name="Valid School")
    app_valid = YouthApplicationFactory.build(school="Valid School")
    assert youth_application_admin.is_valid_school(app_valid) is True

    # Test with invalid school
    app_invalid = YouthApplicationFactory.build(school="Invalid School")
    assert youth_application_admin.is_valid_school(app_invalid) is False


@pytest.mark.django_db
def test_school_filter_lookups(rf):
    # Create some schools
    SchoolFactory(name="School A")
    SchoolFactory(name="School B")

    # Create request
    request = rf.get("/")

    # Instantiate filter
    # We need to mock model_admin, but for simple list filter it's not strictly used in lookups usually,
    # but based on our implementation: def lookups(self, request, model_admin):
    # So we can pass None or a mock
    school_filter = SchoolFilter(request, {}, YouthApplication, YouthApplicationAdmin)

    lookups = school_filter.lookups(request, None)

    assert ("School A", "School A") in lookups
    assert ("School B", "School B") in lookups
    # There might be other schools from other tests or seed data, so we don't assert count


@pytest.mark.django_db
def test_school_filter_queryset(rf):
    # Create schools and applications
    SchoolFactory(name="School A")
    SchoolFactory(name="School B")

    app1 = YouthApplicationFactory(school="School A")
    app2 = YouthApplicationFactory(school="School B")
    app3 = YouthApplicationFactory(school="School C")  # Not in School model

    request = rf.get("/")

    # Test filtering for School A
    school_filter_a = SchoolFilter(
        request, {"school": ["School A"]}, YouthApplication, YouthApplicationAdmin
    )
    queryset_a = school_filter_a.queryset(request, YouthApplication.objects.all())
    assert app1 in queryset_a
    assert app2 not in queryset_a
    assert app3 not in queryset_a

    # Test filtering for School B
    school_filter_b = SchoolFilter(
        request, {"school": ["School B"]}, YouthApplication, YouthApplicationAdmin
    )
    queryset_b = school_filter_b.queryset(request, YouthApplication.objects.all())
    assert app1 not in queryset_b
    assert app2 in queryset_b
    assert app3 not in queryset_b

    # Test no filter
    school_filter_none = SchoolFilter(
        request, {}, YouthApplication, YouthApplicationAdmin
    )
    queryset_none = school_filter_none.queryset(request, YouthApplication.objects.all())
    assert queryset_none.count() == 3


@pytest.mark.django_db
def test_is_valid_school_filter_queryset(rf):
    # Create schools
    SchoolFactory(name="Valid School")

    # Create applications
    app_valid = YouthApplicationFactory(school="Valid School")
    app_invalid = YouthApplicationFactory(school="Invalid School")

    request = rf.get("/")

    # Test filtering for valid schools (Yes)
    filter_yes = IsValidSchoolFilter(
        request, {"is_valid_school": ["yes"]}, YouthApplication, YouthApplicationAdmin
    )
    queryset_yes = filter_yes.queryset(request, YouthApplication.objects.all())
    assert app_valid in queryset_yes
    assert app_invalid not in queryset_yes

    # Test filtering for invalid schools (No)
    filter_no = IsValidSchoolFilter(
        request, {"is_valid_school": ["no"]}, YouthApplication, YouthApplicationAdmin
    )
    queryset_no = filter_no.queryset(request, YouthApplication.objects.all())
    assert app_valid not in queryset_no
    assert app_invalid in queryset_no

    # Test no filter
    filter_none = IsValidSchoolFilter(
        request, {}, YouthApplication, YouthApplicationAdmin
    )
    queryset_none = filter_none.queryset(request, YouthApplication.objects.all())
    assert queryset_none.count() == 2
