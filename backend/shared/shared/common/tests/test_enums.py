import pytest

from shared.common.enums import LoginProvider


def make_test_string_variations(test_values):
    return sorted(
        set(
            [
                format_string.format(value=getattr(value, func_name)())
                for func_name in ["upper", "lower", "title"]
                for format_string in [" {value}", "{value} ", "   {value}    "]
                for value in test_values
            ]
        )
    )


def get_matching_suomi_fi_test_values():
    return make_test_string_variations(
        [
            LoginProvider.SUOMI_FI.value,
            "Suomi.fi",
            "Suomifi",
            "Suomi_fi",
        ]
    )


def get_matching_helsinki_profile_test_values():
    return make_test_string_variations(
        [
            LoginProvider.HELSINKI_PROFILE.value,
            "Helsinki-profiili",
            "Helsinki_profiili",
            "Helsinki profiili",
            "Helsinkiprofiili",
            "Helsinki-profile",
            "Helsinki_profile",
            "Helsinki profile",
            "Helsinkiprofile",
        ]
    )


def get_non_matching_suomi_fi_test_values():
    return get_matching_helsinki_profile_test_values() + [
        "",
        "suomi.finland",
        "test",
    ]


def get_non_matching_helsinki_profile_test_values():
    return get_matching_suomi_fi_test_values() + [
        "",
        "helsingin profiili",
        "test",
    ]


@pytest.mark.parametrize("test_value", get_matching_suomi_fi_test_values())
def test_login_provider_suomi_fi_matcher_match(test_value):
    assert LoginProvider.suomi_fi_matcher().fullmatch(test_value) is not None


@pytest.mark.parametrize("test_value", get_non_matching_suomi_fi_test_values())
def test_login_provider_suomi_fi_matcher_no_match(test_value):
    assert LoginProvider.suomi_fi_matcher().fullmatch(test_value) is None


@pytest.mark.parametrize("test_value", get_matching_helsinki_profile_test_values())
def test_login_provider_helsinki_profile_matcher_match(test_value):
    assert LoginProvider.helsinki_profile_matcher().fullmatch(test_value) is not None


@pytest.mark.parametrize("test_value", get_non_matching_helsinki_profile_test_values())
def test_login_provider_helsinki_profile_matcher_no_match(test_value):
    assert LoginProvider.helsinki_profile_matcher().fullmatch(test_value) is None


@pytest.mark.parametrize("test_value", get_matching_helsinki_profile_test_values())
def test_login_provider_is_helsinki_profile_valid(test_value):
    assert LoginProvider.is_helsinki_profile(test_value)


@pytest.mark.parametrize("test_value", get_non_matching_helsinki_profile_test_values())
def test_login_provider_is_helsinki_profile_invalid(test_value):
    assert not LoginProvider.is_helsinki_profile(test_value)


@pytest.mark.parametrize("test_value", get_matching_suomi_fi_test_values())
def test_login_provider_is_suomi_fi_valid(test_value):
    assert LoginProvider.is_suomi_fi(test_value)


@pytest.mark.parametrize("test_value", get_non_matching_suomi_fi_test_values())
def test_login_provider_is_suomi_fi_invalid(test_value):
    assert not LoginProvider.is_suomi_fi(test_value)
