# services/pdf_service.py
import io
from datetime import UTC, datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

INDIGO = colors.HexColor("#6366F1")
DARK = colors.HexColor("#0A0C10")
MID = colors.HexColor("#475569")
LIGHT_BG = colors.HexColor("#F1F5F9")
SUCCESS = colors.HexColor("#10B981")
DANGER = colors.HexColor("#EF4444")
WARNING = colors.HexColor("#F59E0B")


def score_color(score: float):
    if score >= 85:
        return SUCCESS
    if score >= 70:
        return INDIGO
    if score >= 50:
        return WARNING
    return DANGER


def generate_candidate_report(candidate: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle(
        "H1", parent=styles["Heading1"], fontSize=20, textColor=DARK, spaceAfter=2 * mm
    )
    h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=INDIGO,
        spaceAfter=2 * mm,
        spaceBefore=4 * mm,
    )
    body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, textColor=MID, leading=15)
    label = ParagraphStyle("Label", parent=styles["Normal"], fontSize=9, textColor=MID)
    mono = ParagraphStyle(
        "Mono", parent=styles["Normal"], fontSize=9, fontName="Courier", textColor=DARK, leading=14
    )

    ai = candidate.get("ai_score") or {}
    breakdown = ai.get("breakdown") or {}
    score = candidate.get("overall_score", 0)

    story = []

    # ── Header ─────────────────────────────────────────────────────────────
    story.append(Paragraph(candidate.get("name", "Candidate"), h1))
    story.append(
        Paragraph(
            f"{candidate.get('email', '')}   ·   {candidate.get('job_title', '')}   ·   {candidate.get('stage', '')}",
            label,
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(HRFlowable(width="100%", color=INDIGO, thickness=2))
    story.append(Spacer(1, 4 * mm))

    # ── Score summary table ─────────────────────────────────────────────────
    sc = score_color(score)
    score_data = [
        ["AI Score", "ATS Score", "Stage", "Source", "Applied"],
        [
            Paragraph(
                f"<font color='#{sc.hexval()[2:]}' size='18'><b>{int(score)}</b></font>", body
            ),
            Paragraph(f"<b>{int(candidate.get('ats_score', 0))}</b>", body),
            candidate.get("stage", ""),
            candidate.get("source", ""),
            candidate.get("created_at", "")[:10],
        ],
    ]
    t = Table(score_data, colWidths=[35 * mm, 35 * mm, 35 * mm, 35 * mm, 35 * mm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
                ("TEXTCOLOR", (0, 0), (-1, 0), MID),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWBACKGROUNDS", (0, 1), (-1, 1), [colors.white]),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 4 * mm))

    # ── AI Summary ──────────────────────────────────────────────────────────
    if ai.get("summary"):
        story.append(Paragraph("AI Assessment", h2))
        story.append(Paragraph(ai["summary"], body))
        story.append(Spacer(1, 3 * mm))

    # ── Score Breakdown ─────────────────────────────────────────────────────
    if breakdown:
        story.append(Paragraph("Score Breakdown", h2))
        bd_data = [["Category", "Score", "Max", "Notes"]]
        cats = [
            ("Skill Match", "skill_match", 40),
            ("Experience", "experience", 30),
            ("Education", "education", 15),
            ("Communication", "communication", 15),
        ]
        for label_str, key, max_pts in cats:
            d = breakdown.get(key, {})
            s = d.get("score", 0)
            notes = ""
            if key == "skill_match":
                matched = ", ".join(d.get("matched_skills", [])[:4])
                notes = f"Matched: {matched}" if matched else ""
            elif key == "experience":
                notes = f"{d.get('years_detected', 0)}y detected · {d.get('relevance', '')}"
            elif key == "education":
                notes = f"{d.get('degree', '')} {d.get('field', '')}".strip()
            elif key == "communication":
                notes = d.get("clarity", "")
            bd_data.append([label_str, str(s), str(max_pts), notes])

        bt = Table(bd_data, colWidths=[45 * mm, 20 * mm, 20 * mm, 90 * mm])
        bt.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("ALIGN", (1, 0), (2, -1), "CENTER"),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.HexColor("#F8FAFC")],
                    ),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.append(bt)
        story.append(Spacer(1, 3 * mm))

    # ── Strengths / Weaknesses ───────────────────────────────────────────────
    strengths = ai.get("strengths", [])
    weaknesses = ai.get("weaknesses", [])
    if strengths or weaknesses:
        story.append(Paragraph("Strengths & Weaknesses", h2))
        sw_data = [
            [Paragraph("<b>Strengths</b>", body), Paragraph("<b>Areas for Development</b>", body)],
            [
                Paragraph("\n".join(f"✓ {s}" for s in strengths), mono),
                Paragraph("\n".join(f"- {w}" for w in weaknesses), mono),
            ],
        ]
        sw = Table(sw_data, colWidths=[87 * mm, 87 * mm])
        sw.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(sw)
        story.append(Spacer(1, 3 * mm))

    # ── Interview Questions ──────────────────────────────────────────────────
    qs = ai.get("interview_questions", {})
    if any(qs.values()):
        story.append(Paragraph("Interview Questions", h2))
        for qtype, items in qs.items():
            if items:
                story.append(Paragraph(qtype.replace("_", " ").title(), label))
                for i, q in enumerate(items, 1):
                    story.append(Paragraph(f"{i}. {q}", body))
                story.append(Spacer(1, 2 * mm))

    # ── Footer ──────────────────────────────────────────────────────────────
    story.append(Spacer(1, 6 * mm))
    story.append(HRFlowable(width="100%", color=colors.HexColor("#E2E8F0"), thickness=0.5))
    story.append(
        Paragraph(
            f"Generated by RecruitAI · {datetime.now(UTC).strftime('%Y-%m-%d %H:%M UTC')}",
            ParagraphStyle(
                "Footer",
                parent=label,
                fontSize=8,
                textColor=colors.HexColor("#94A3B8"),
                alignment=TA_CENTER,
            ),
        )
    )

    doc.build(story)
    buf.seek(0)
    return buf.read()
