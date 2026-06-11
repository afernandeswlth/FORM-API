import io
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Table, TableStyle,
    Spacer, Image, HRFlowable,
)

# ── Brand colours ────────────────────────────────────────────────────────────
WLTH_DARK   = colors.HexColor("#1a1a2e")
BORDER_GREY = colors.HexColor("#d0d0d0")
LIGHT_GREY  = colors.HexColor("#f7f7f7")
TEXT_GREY   = colors.HexColor("#555555")
WARN_BG     = colors.HexColor("#fff3e0")
WARN_BORDER = colors.HexColor("#e65100")
PAGE_W, PAGE_H = A4


def _decode_sig(sig_b64: str) -> bytes:
    if "," in sig_b64:
        sig_b64 = sig_b64.split(",", 1)[1]
    return base64.b64decode(sig_b64)


def _sig_image(sig_b64: str, width: float = 55 * mm, height: float = 18 * mm) -> Image:
    raw = _decode_sig(sig_b64)
    buf = io.BytesIO(raw)
    img = Image(buf, width=width, height=height)
    img.hAlign = "LEFT"
    return img


def _styles():
    base = getSampleStyleSheet()
    return {
        "logo": ParagraphStyle(
            "logo", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=16,
            textColor=WLTH_DARK, spaceAfter=0,
        ),
        "title": ParagraphStyle(
            "title", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=14,
            textColor=WLTH_DARK, spaceBefore=4 * mm, spaceAfter=2 * mm,
        ),
        "subtitle": ParagraphStyle(
            "subtitle", parent=base["Normal"],
            fontName="Helvetica-Oblique", fontSize=9,
            textColor=TEXT_GREY, spaceAfter=3 * mm,
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"],
            fontName="Helvetica", fontSize=8.5,
            textColor=colors.black, leading=12, spaceAfter=2 * mm,
            alignment=TA_JUSTIFY,
        ),
        "section": ParagraphStyle(
            "section", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=10,
            textColor=WLTH_DARK, spaceBefore=4 * mm, spaceAfter=1.5 * mm,
        ),
        "label": ParagraphStyle(
            "label", parent=base["Normal"],
            fontName="Helvetica", fontSize=8,
            textColor=TEXT_GREY, spaceAfter=0.5 * mm,
        ),
        "warn": ParagraphStyle(
            "warn", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=9,
            textColor=WARN_BORDER, spaceAfter=1 * mm,
        ),
        "footer": ParagraphStyle(
            "footer", parent=base["Normal"],
            fontName="Helvetica", fontSize=7,
            textColor=TEXT_GREY, alignment=TA_CENTER,
        ),
    }


def _authorisation_block(idx: int, borrower: dict, auth: dict, s: dict):
    name = f"{borrower['given_names']} {borrower['surname']}"
    elems = []
    elems.append(Paragraph(f"Borrower {idx + 1} – {name}", s["section"]))

    elems.append(Paragraph("Signature", s["label"]))
    try:
        elems.append(_sig_image(auth["signature_base64"]))
    except Exception:
        elems.append(Paragraph("[Signature not available]", s["label"]))
    elems.append(Spacer(1, 2 * mm))

    date_data = [["Date"], [str(auth["signed_date"])]]
    dt = Table(date_data, colWidths=[60 * mm])
    dt.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (0, 0),  "Helvetica"),
        ("FONTNAME",      (0, 1), (0, 1),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR",     (0, 0), (0, 0),  TEXT_GREY),
        ("TEXTCOLOR",     (0, 1), (0, 1),  colors.black),
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.3, BORDER_GREY),
    ]))
    elems.append(dt)
    elems.append(Spacer(1, 3 * mm))
    return elems


def _page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(TEXT_GREY)
    txt = "WLTH-V1.1  |  Redraw Request Form  |  Australian Credit Licence 525752"
    canvas.drawCentredString(PAGE_W / 2, 12 * mm, txt)
    canvas.drawRightString(PAGE_W - 20 * mm, 12 * mm, f"P{doc.page}")
    canvas.restoreState()


def generate_pdf(data: dict) -> bytes:
    buffer = io.BytesIO()
    s = _styles()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=22 * mm,
    )

    story = []

    # ── Header ────────────────────────────────────────────────────────────
    story.append(Paragraph("WLTH", s["logo"]))
    story.append(Spacer(1, 2 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=WLTH_DARK, spaceAfter=3 * mm))
    story.append(Paragraph("Redraw Request", s["title"]))
    story.append(Paragraph("Access available redraw funds from your WLTH loan", s["subtitle"]))

    story.append(Paragraph(
        "I/We request that WLTH process the following redraw on the above loan account.",
        s["body"],
    ))

    # ── Borrowers ─────────────────────────────────────────────────────────
    story.append(Paragraph("Borrower(s)", s["section"]))
    borrowers = data.get("borrowers", [])
    bor_data = [["", "Surname", "Given Name(s)"]]
    for i, b in enumerate(borrowers):
        bor_data.append([f"Borrower {i + 1}", b["surname"], b["given_names"]])

    bt = Table(bor_data, colWidths=[30 * mm, 60 * mm, 70 * mm])
    bt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  LIGHT_GREY),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  WLTH_DARK),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("GRID",          (0, 0), (-1, -1), 0.3, BORDER_GREY),
    ]))
    story.append(bt)
    story.append(Spacer(1, 3 * mm))

    # ── Loan Account ──────────────────────────────────────────────────────
    story.append(Paragraph("Loan Account Number", s["section"]))
    lan_data = [["Loan Account Number", data.get("loan_account_number", "—")]]
    lan = Table(lan_data, colWidths=[55 * mm, 105 * mm])
    lan.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (0, 0),  "Helvetica"),
        ("FONTNAME",      (1, 0), (1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR",     (0, 0), (0, 0),  TEXT_GREY),
        ("TEXTCOLOR",     (1, 0), (1, 0),  colors.black),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.3, BORDER_GREY),
    ]))
    story.append(lan)
    story.append(Spacer(1, 3 * mm))

    # ── Redraw Destination ────────────────────────────────────────────────
    story.append(Paragraph("Redraw Destination", s["section"]))
    dest = data.get("redraw_destination", {})
    amount = dest.get("redraw_amount", 0)
    large  = dest.get("large_amount", False)
    amount_str = f"${amount:,.2f}"
    if large:
        amount_str += "  ★ $100,000 or more – Refer to WLTH"

    dest_data = [
        ["To Account Name", dest.get("to_account_name", "—")],
        ["BSB",             dest.get("bsb", "—")],
        ["Account Number",  dest.get("account_number", "—")],
        ["Redraw Amount",   amount_str],
    ]
    dt = Table(dest_data, colWidths=[45 * mm, 115 * mm])
    dt.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica"),
        ("FONTNAME",      (1, 0), (1, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR",     (0, 0), (0, -1), TEXT_GREY),
        ("TEXTCOLOR",     (1, 0), (1, -1), colors.black),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.3, BORDER_GREY),
    ]))
    story.append(dt)

    if large:
        story.append(Spacer(1, 3 * mm))
        story.append(Paragraph(
            "⚠  Amount is $100,000 or more — please contact WLTH before processing.",
            s["warn"],
        ))

    story.append(Spacer(1, 3 * mm))

    # ── Redraw Reason ─────────────────────────────────────────────────────
    reason = data.get("redraw_reason", "")
    if reason:
        story.append(Paragraph("Redraw Reason", s["section"]))
        story.append(Paragraph(
            "Kindly specify what the funds will be used for:",
            s["label"],
        ))
        reason_data = [["", reason]]
        rt = Table(reason_data, colWidths=[0, 160 * mm])
        rt.setStyle(TableStyle([
            ("FONTNAME",      (1, 0), (1, 0), "Helvetica"),
            ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
            ("TEXTCOLOR",     (1, 0), (1, 0), colors.black),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",    (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LINEBELOW",     (0, 0), (-1, -1), 0.3, BORDER_GREY),
        ]))
        story.append(rt)
        story.append(Spacer(1, 3 * mm))

    # ── Signatures ────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_GREY, spaceAfter=3 * mm))
    story.append(Paragraph("Customer Signatures", s["section"]))
    story.append(Paragraph(
        "I/we authorise the above redraw request and confirm all details are correct.",
        s["body"],
    ))

    authorisations = data.get("authorisations", [])
    for i, (borrower, auth) in enumerate(zip(borrowers, authorisations)):
        for elem in _authorisation_block(i, borrower, auth, s):
            story.append(elem)

    doc.build(story, onFirstPage=_page_footer, onLaterPages=_page_footer)
    return buffer.getvalue()
