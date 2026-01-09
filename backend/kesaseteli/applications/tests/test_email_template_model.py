import pytest

from applications.enums import EmailTemplateType
from applications.models import EmailTemplate


@pytest.mark.django_db(transaction=True)
def test_email_template_save_strips_head_and_excessive_newlines():
    """
    Test that EmailTemplate.save() correctly strips the <head> section
    (including title) and collapses excessive newlines in the text body.
    """
    # Cleanup potential previous run data
    EmailTemplate.objects.filter(
        type=EmailTemplateType.YOUTH_SUMMER_VOUCHER, language="fi"
    ).delete()
    html_content = """
<html>
<head>
    <title>Should be removed</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>Header</h1>
    <p>Paragraph 1.</p>
    
    
    
    <p>Paragraph 2.</p>
</body>
</html>
    """  # noqa: W293

    template = EmailTemplate(
        type=EmailTemplateType.YOUTH_SUMMER_VOUCHER,
        language="fi",
        subject="Test Subject",
        html_body=html_content,
    )
    template.save()

    # Check that title content is removed
    assert "Should be removed" not in template.text_body

    # Check that text content is present
    assert "Header" in template.text_body
    assert "Paragraph 1." in template.text_body
    assert "Paragraph 2." in template.text_body

    # Check newline normalization (should not have more than 2 consecutive newlines)
    assert "\n\n\n" not in template.text_body

    # Verify exact structure
    # NOTE: strip_tags preserves newlines from HTML source.
    # Between Header and Paragraph 1 there is only one newline in source (after </h1>).
    # Between Paragraph 1 and 2 there are many, which are collapsed to 2.
    expected_text = "Header\nParagraph 1.\n\nParagraph 2."
    assert template.text_body == expected_text
