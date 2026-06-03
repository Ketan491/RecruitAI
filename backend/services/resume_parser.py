# services/resume_parser.py
import io
import logging

import pdfplumber
from docx import Document as DocxDocument

logger = logging.getLogger(__name__)


def parse_pdf(content: bytes) -> str:
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages).strip()
    except Exception as e:
        logger.error("PDF parse error: %s", e)
        return ""


def parse_docx(content: bytes) -> str:
    try:
        doc = DocxDocument(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()
    except Exception as e:
        logger.error("DOCX parse error: %s", e)
        return ""


def parse_resume(content: bytes, mime_type: str) -> str:
    if mime_type == "application/pdf":
        return parse_pdf(content)
    elif mime_type in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ):
        return parse_docx(content)
    return content.decode("utf-8", errors="ignore")


def detect_mime_from_magic(content: bytes) -> str:
    """Detect file type from magic bytes, not user-supplied Content-Type."""
    if content[:4] == b"%PDF":
        return "application/pdf"
    if content[:2] == b"PK":  # ZIP-based (DOCX)
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    raise ValueError("Unsupported file type. Only PDF and DOCX are allowed.")


async def parse_resume_from_url(resume_url: str) -> str:
    """Fetch a resume from S3 and parse it to text. Used for on-demand re-scoring."""
    import httpx

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(resume_url)
        response.raise_for_status()
        content = response.content

    mime_type = detect_mime_from_magic(content)
    return parse_resume(content, mime_type)
