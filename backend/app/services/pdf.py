"""Live profile -> résumé PDF (ReportLab) with a QR code back to the live profile.
Registers a Cyrillic-capable TTF so Tajik/Russian text renders correctly."""
from __future__ import annotations

import io
import os

import qrcode
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

_FONT = "Helvetica"
_FONT_BOLD = "Helvetica-Bold"

# Try to register a Unicode font for Cyrillic (Tajik/Russian).
for _name, _bold, _candidates in (
    ("Imkon", False, [r"C:\Windows\Fonts\arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]),
    ("Imkon-Bold", True, [r"C:\Windows\Fonts\arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]),
):
    for _path in _candidates:
        if os.path.exists(_path):
            try:
                pdfmetrics.registerFont(TTFont(_name, _path))
                if _bold:
                    _FONT_BOLD = _name
                else:
                    _FONT = _name
            except Exception:
                pass
            break

TEAL = colors.HexColor("#2A8C7E")
GOLD = colors.HexColor("#C9A24B")
DARK = colors.HexColor("#14211F")


def _qr_image(url: str) -> Image | None:
    if not url:
        return None
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return Image(buf, width=28 * mm, height=28 * mm)


def resume_pdf(profile: dict, achievements: list[dict], public_url: str | None = None) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=16 * mm, bottomMargin=16 * mm, title="Imkon résumé")
    ss = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=ss["Title"], fontName=_FONT_BOLD, textColor=DARK, fontSize=22)
    h2 = ParagraphStyle("h2", parent=ss["Heading2"], fontName=_FONT_BOLD, textColor=TEAL, fontSize=13,
                        spaceBefore=10, spaceAfter=4)
    body = ParagraphStyle("body", parent=ss["BodyText"], fontName=_FONT, fontSize=10.5,
                         leading=15, alignment=TA_LEFT)
    small = ParagraphStyle("small", parent=body, fontSize=9, textColor=colors.grey)

    name = profile.get("display_name") or profile.get("full_name") or "Профиль Имкон"
    story: list = []

    header_cells = [[Paragraph(name, h1)]]
    qr = _qr_image(public_url) if public_url else None
    if qr:
        header = Table([[Paragraph(name, h1), qr]], colWidths=[None, 30 * mm])
        header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
        story.append(header)
    else:
        story.append(Paragraph(name, h1))

    meta = " · ".join(
        x for x in [profile.get("city"), f"Trust Score: {profile.get('trust_score', 0)}"] if x
    )
    story.append(Paragraph(meta, small))
    story.append(Spacer(1, 4))

    if profile.get("goal"):
        story.append(Paragraph("Цель", h2))
        story.append(Paragraph(str(profile["goal"]), body))

    skills = profile.get("skills") or []
    if skills:
        story.append(Paragraph("Навыки", h2))
        for s in skills:
            nm = s.get("name") if isinstance(s, dict) else str(s)
            verified = isinstance(s, dict) and s.get("verified")
            story.append(Paragraph(f"• {nm}{'  ✅' if verified else ''}", body))

    verified_ach = [a for a in achievements if a.get("verified")]
    if verified_ach:
        story.append(Paragraph("Подтверждённый опыт", h2))
        for a in verified_ach:
            line = f"• {a.get('title')}"
            if a.get("verified_by"):
                line += f" — {a['verified_by']} ✅"
            story.append(Paragraph(line, body))

    contacts = [c for c in [profile.get("email"), profile.get("phone")] if c]
    if contacts:
        story.append(Paragraph("Контакты", h2))
        story.append(Paragraph(", ".join(contacts), body))

    if public_url:
        story.append(Spacer(1, 8))
        story.append(Paragraph(f"Живой профиль: {public_url}", small))

    doc.build(story)
    return buf.getvalue()
