from unittest.mock import Mock

import pytest
from django.http import HttpRequest

from shared.audit_log.utils import get_remote_address


@pytest.mark.parametrize(
    "x_forwarded_for", [True, False]
)
@pytest.mark.parametrize(
    "remote_address, expected_ip",
    [
        # IPv4 cases
        ("12.23.34.45", "12.23.34.45"),
        ("12.23.34.45:1234", "12.23.34.45"),
        # IPv6 cases
        ("2001:db8::1", "2001:db8::1"),
        ("[2001:db8::1]", "2001:db8::1"),
        ("[2001:db8::1]:1234", "2001:db8::1"),
        ("2001:db8:0:0:0:0:0:1", "2001:db8:0:0:0:0:0:1"),
        ("[2001:db8:0:0:0:0:0:1]", "2001:db8:0:0:0:0:0:1"),
        ("[2001:db8:0:0:0:0:0:1]:1234", "2001:db8:0:0:0:0:0:1"),
        # IPv4-mapped IPv6 cases
        ("::ffff:192.0.2.1", "::ffff:192.0.2.1"),
        ("[::ffff:192.0.2.1]:1234", "::ffff:192.0.2.1"),
    ],
)
def test_get_remote_address(remote_address, expected_ip, x_forwarded_for):
    req_mock = Mock(
        headers={"x-forwarded-for": remote_address} if x_forwarded_for else {},
        META={"REMOTE_ADDR": remote_address} if not x_forwarded_for else {},
    )
    assert get_remote_address(req_mock) == expected_ip
