# tests/test_resume_parser.py
import pytest

from backend.services.resume_parser import detect_mime_from_magic, parse_docx, parse_pdf


def test_detect_pdf_magic():
    pdf_magic = b"%PDF-1.4 ..."
    mime = detect_mime_from_magic(pdf_magic)
    assert mime == "application/pdf"


def test_detect_docx_magic():
    # DOCX files start with PK (ZIP magic bytes)
    docx_magic = b"PK\x03\x04" + b"\x00" * 100
    mime = detect_mime_from_magic(docx_magic)
    assert "wordprocessingml" in mime


def test_detect_invalid_file():
    with pytest.raises(ValueError, match="Unsupported"):
        detect_mime_from_magic(b"\xff\xfeBadFile")


def test_parse_empty_bytes_pdf():
    result = parse_pdf(b"")
    assert isinstance(result, str)


def test_parse_empty_bytes_docx():
    result = parse_docx(b"")
    assert isinstance(result, str)
