import uuid

import pytest
from django.core.files.base import ContentFile
from django.urls import reverse
from rest_framework.test import APIRequestFactory

from terms.api.v1.serializers import TermsSerializer
from terms.enums import TermsType
from terms.tests.factories import TermsFactory

PDF_CONTENT = b"%PDF-1.4 fake pdf content for testing"


def get_download_url(terms_id, number, language):
    return reverse(
        "terms-pdf-download",
        kwargs={"terms_id": terms_id, "number": number, "language": language},
    )


@pytest.fixture
def terms_with_pdfs():
    terms = TermsFactory(terms_type=TermsType.APPLICANT_TERMS)
    terms.terms_pdf_fi.save("terms_fi.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_en.save("terms_en.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_sv.save("terms_sv.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_2_fi.save("terms_2_fi.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_2_en.save("terms_2_en.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_2_sv.save("terms_2_sv.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_3_fi.save("terms_3_fi.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_3_en.save("terms_3_en.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_3_sv.save("terms_3_sv.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_4_fi.save("terms_4_fi.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_4_en.save("terms_4_en.pdf", ContentFile(PDF_CONTENT), save=True)
    terms.terms_pdf_4_sv.save("terms_4_sv.pdf", ContentFile(PDF_CONTENT), save=True)

    yield terms
    terms.terms_pdf_fi.delete(save=False)
    terms.terms_pdf_en.delete(save=False)
    terms.terms_pdf_sv.delete(save=False)
    terms.terms_pdf_2_fi.delete(save=False)
    terms.terms_pdf_2_en.delete(save=False)
    terms.terms_pdf_2_sv.delete(save=False)
    terms.terms_pdf_3_fi.delete(save=False)
    terms.terms_pdf_3_en.delete(save=False)
    terms.terms_pdf_3_sv.delete(save=False)
    terms.terms_pdf_4_fi.delete(save=False)
    terms.terms_pdf_4_en.delete(save=False)
    terms.terms_pdf_4_sv.delete(save=False)


@pytest.fixture
def terms_without_pdfs():
    terms = TermsFactory(
        terms_type=TermsType.APPLICANT_TERMS,
        terms_pdf_fi="",
        terms_pdf_en="",
        terms_pdf_sv="",
        terms_pdf_2_fi="",
        terms_pdf_2_en="",
        terms_pdf_2_sv="",
        terms_pdf_3_fi="",
        terms_pdf_3_en="",
        terms_pdf_3_sv="",
        terms_pdf_4_fi="",
        terms_pdf_4_en="",
        terms_pdf_4_sv="",
    )
    return terms


@pytest.mark.django_db
@pytest.mark.parametrize(
    "number,language",
    [
        (1, "fi"),
        (2, "fi"),
        (3, "fi"),
        (4, "fi"),
        (1, "en"),
        (2, "en"),
        (3, "en"),
        (4, "en"),
        (1, "sv"),
        (2, "sv"),
        (3, "sv"),
        (4, "sv"),
    ],
)
def test_terms_pdf_download_applicant(api_client, terms_with_pdfs, number, language):
    response = api_client.get(get_download_url(terms_with_pdfs.id, number, language))
    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"
    assert b"".join(response.streaming_content) == PDF_CONTENT


@pytest.mark.django_db
@pytest.mark.parametrize("language", ["fi", "en", "sv"])
def test_terms_pdf_download_handler(handler_api_client, terms_with_pdfs, language):
    response = handler_api_client.get(get_download_url(terms_with_pdfs.id, 1, language))
    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"


@pytest.mark.django_db
def test_terms_pdf_download_unauthenticated(anonymous_client, terms_with_pdfs):
    response = anonymous_client.get(get_download_url(terms_with_pdfs.id, 1, "fi"))
    assert response.status_code == 403


@pytest.mark.django_db
def test_terms_pdf_download_invalid_language(api_client, terms_with_pdfs):
    response = api_client.get(get_download_url(terms_with_pdfs.id, 1, "de"))
    assert response.status_code == 400


@pytest.mark.django_db
def test_terms_pdf_download_nonexistent_terms(api_client):
    response = api_client.get(get_download_url(uuid.uuid4(), 1, "fi"))
    assert response.status_code == 404


@pytest.mark.django_db
def test_terms_pdf_download_missing_pdf(api_client, terms_without_pdfs):
    response = api_client.get(get_download_url(terms_without_pdfs.id, 1, "fi"))
    assert response.status_code == 404


@pytest.mark.django_db
@pytest.mark.parametrize(
    "number,lang",
    [
        ("1", "fi"),
        ("1", "en"),
        ("1", "sv"),
        ("2", "fi"),
        ("2", "en"),
        ("2", "sv"),
        ("3", "fi"),
        ("3", "en"),
        ("3", "sv"),
        ("4", "fi"),
        ("4", "en"),
        ("4", "sv"),
    ],
)
def test_terms_serializer_returns_proxy_urls(api_client, terms_with_pdfs, number, lang):
    """PDF fields in the serializer should return proxy download URLs, not blob storage URLs."""
    factory = APIRequestFactory()
    request = factory.get("/")
    request.user = api_client.handler._force_user

    serializer = TermsSerializer(terms_with_pdfs, context={"request": request})
    data = serializer.data

    if number == "1":
        field = f"terms_pdf_{lang}"
    else:
        field = f"terms_pdf_{number}_{lang}"
    assert data[field] is not None
    assert f"/v1/terms/{terms_with_pdfs.id}/download/{number}/{lang}/" in data[field]
    assert "blob" not in data[field]
    assert "?" not in data[field]


@pytest.mark.django_db
def test_terms_serializer_returns_none_for_missing_pdf(api_client, terms_without_pdfs):
    factory = APIRequestFactory()
    request = factory.get("/")
    request.user = api_client.handler._force_user

    serializer = TermsSerializer(terms_without_pdfs, context={"request": request})
    data = serializer.data

    for lang in ("fi", "en", "sv"):
        assert data[f"terms_pdf_{lang}"] is None
