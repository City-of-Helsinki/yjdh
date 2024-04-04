import os

from common.tests.conftest import reseed


def before_test_reseed(no_reseed_for_tests: list[str] = []):
    """
    Tests would fail in CI if same seed is used throughout all tests.
    Factories create too many similar objects and database will fail on unique
    constraints. Use fixture to reseed before each test to avoid this issue.

    :param no_reseed_for_tests: list of test names that should use the default seed defined in conftest.py
    """
    current_test = os.environ.get("PYTEST_CURRENT_TEST")

    for test in no_reseed_for_tests:
        if test in current_test:
            print("passing reseed")
        else:
            print("reseeding with", current_test)
            reseed(current_test)
