from io import StringIO

import pytest
from django.core.management import call_command

from applications.models import YouthApplication
from common.tests.factories import YouthApplicationFactory

# Finnish social security numbers for testing
TEST_SSNS = ["111111-111C", "010101-123N", "311299A9876", "010101-1234", "121212A899H"]


def stored_hashes_by_pk():
    """
    Helper function to return stored social_security_number hashes
    by youth application primary key
    """
    return dict(
        YouthApplication.objects.values_list("pk", "social_security_number").order_by(
            "pk"
        )
    )


@pytest.fixture(autouse=True)
def set_social_security_number_hash_key_for_tests(settings):
    settings.SOCIAL_SECURITY_NUMBER_HASH_KEY = "initial-test-hash-key"


@pytest.mark.django_db
def test_stored_hashes_by_pk(settings):
    """
    Test that stored_hashes_by_pk helper function gives hashed results,
    not plaintext social security number values, and that its results change
    when settings.SOCIAL_SECURITY_NUMBER_HASH_KEY is changed.
    """
    initial_hash_key = settings.SOCIAL_SECURITY_NUMBER_HASH_KEY
    app = YouthApplicationFactory(social_security_number="111111-111C")
    expected_initial_hashed_result = (
        "xx94093b1e4729549ff7324217305690738e92a3890da840b72cdef7874bbed4ff"
    )
    assert stored_hashes_by_pk() == {app.pk: expected_initial_hashed_result}
    settings.SOCIAL_SECURITY_NUMBER_HASH_KEY = "something-else"
    assert stored_hashes_by_pk() == {
        app.pk: "xx94093b1e4729549ff7324217305690738e92a3890da840b72cdef7874bbed4ff"
    }
    settings.SOCIAL_SECURITY_NUMBER_HASH_KEY = initial_hash_key
    assert stored_hashes_by_pk() == {app.pk: expected_initial_hashed_result}


@pytest.mark.django_db
def test_rehash_youth_application_ssn_dry_run_writes_nothing():
    for ssn in TEST_SSNS:
        YouthApplicationFactory(social_security_number=ssn)
    before = stored_hashes_by_pk()

    out = StringIO()
    call_command("rehash_youth_application_ssn", "--dry-run", stdout=out)

    assert (
        f"Dry run: {len(TEST_SSNS)} youth application search hashes would be rebuilt."
        in (out.getvalue())
    )
    assert stored_hashes_by_pk() == before


@pytest.mark.django_db
def test_rehash_youth_application_ssn_is_noop_when_key_unchanged():
    for ssn in TEST_SSNS:
        YouthApplicationFactory(social_security_number=ssn)
    before = stored_hashes_by_pk()

    out = StringIO()
    call_command("rehash_youth_application_ssn", stdout=out)

    assert (
        f"Successfully rebuilt {len(TEST_SSNS)} youth application search hashes."
        in out.getvalue()
    )
    # Same hash key → identical hashes recomputed
    assert stored_hashes_by_pk() == before
    # Exact-match search still works for every row
    for ssn in TEST_SSNS:
        assert YouthApplication.objects.filter(social_security_number=ssn).exists()


@pytest.mark.django_db
def test_rehash_youth_application_ssn_restores_search_after_key_change(settings):
    for ssn in TEST_SSNS:
        YouthApplicationFactory(social_security_number=ssn)
    before = stored_hashes_by_pk()

    # Search works under the original key
    for ssn in TEST_SSNS:
        assert YouthApplication.objects.filter(social_security_number=ssn).exists()

    # Rotate the key: stored hashes were computed with the old key, so a query
    # (hashed with the new key) no longer matches.
    settings.SOCIAL_SECURITY_NUMBER_HASH_KEY = "different-hash-key-value"
    for ssn in TEST_SSNS:
        assert not YouthApplication.objects.filter(social_security_number=ssn).exists()

    out = StringIO()
    call_command("rehash_youth_application_ssn", stdout=out)

    # After rehashing with the new key, exact-match search works again
    assert (
        f"Successfully rebuilt {len(TEST_SSNS)} youth application search hashes."
        in out.getvalue()
    )
    for ssn in TEST_SSNS:
        assert YouthApplication.objects.filter(social_security_number=ssn).exists()
    assert list(stored_hashes_by_pk().values()) != list(
        before.values()
    )  # Hashes must have changed
    assert list(stored_hashes_by_pk().keys()) == list(
        before.keys()
    )  # Primary keys must be unchanged


@pytest.mark.django_db
@pytest.mark.parametrize(
    "youth_application_count, batch_size",
    [
        (1, 1),  # Single row, single batch → 1 batch
        (10, 5),  # Exact multiple of batch size (2 batches: 5+5)
        (17, 3),  # Non-multiple of batch size (6 batches: 3+3+3+3+3+2)
        (5, 6),  # Batch size over input size → 1 batch
    ],
)
def test_rehash_youth_application_ssn_respects_batch_size(
    youth_application_count, batch_size, django_assert_max_num_queries
):
    apps = YouthApplicationFactory.create_batch(size=youth_application_count)
    ssns = [app.social_security_number for app in apps]

    out = StringIO()
    expected_batch_count = youth_application_count // batch_size + (
        # One extra update if youth application count is not an exact multiple of batch size:
        1 if youth_application_count % batch_size else 0
    )
    expected_query_count_upper_limit = (
        1  # SELECT pks
        + expected_batch_count
        * 4  # SAVEPOINT, SELECT...FOR UPDATE, UPDATE, RELEASE SAVEPOINT
    )
    with django_assert_max_num_queries(expected_query_count_upper_limit):
        call_command(
            "rehash_youth_application_ssn", "--batch-size", batch_size, stdout=out
        )

    assert (
        f"Successfully rebuilt {youth_application_count} youth application search hashes."
        in out.getvalue()
    )
    # Exact-match search should work for every row still
    for ssn in ssns:
        assert YouthApplication.objects.filter(social_security_number=ssn).exists()
