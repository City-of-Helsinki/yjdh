import langdetect


def assert_email_subject_language(email_subject, expected_language):
    detected_language = langdetect.detect(email_subject)
    assert (
        detected_language == expected_language
    ), "Email subject '{}' used language {} instead of expected {}".format(
        email_subject, detected_language, expected_language
    )


def assert_email_body_language(email_body, expected_language):
    detected_language = langdetect.detect(email_body)
    assert (
        detected_language == expected_language
    ), "Email body '{}' used language {} instead of expected {}".format(
        email_body, detected_language, expected_language
    )
