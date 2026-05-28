"""Shared example payloads for create-without-SSN tests."""

from applications.target_groups import NinthGraderTargetGroup

CREATE_WITHOUT_SSN_EXAMPLES = {
    "first_name": "Testi",
    "last_name": "Testaaja",
    "email": "test@example.org",
    "school": "Testikoulu",
    "phone_number": "+358-50-1234567",
    "postcode": "00123",
    "language": "sv",
    "non_vtj_birthdate": "2012-12-31",
    "non_vtj_home_municipality": "Kirkkonummi",
    "additional_info_description": "Testilisätiedot",
    "target_group": NinthGraderTargetGroup.identifier,
}
