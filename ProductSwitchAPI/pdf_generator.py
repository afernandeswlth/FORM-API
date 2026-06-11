import io
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Table, TableStyle,
    Spacer, Image, HRFlowable,
)

# ── Brand colours ────────────────────────────────────────────────────────────
WLTH_DARK   = colors.HexColor("#1a1a2e")
WLTH_BLUE   = colors.HexColor("#1565C0")
BORDER_GREY = colors.HexColor("#d0d0d0")
LIGHT_GREY  = colors.HexColor("#f7f7f7")
TEXT_GREY   = colors.HexColor("#555555")
PAGE_W, PAGE_H = A4


# ── Helpers ──────────────────────────────────────────────────────────────────

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
    custom = {
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
        "value": ParagraphStyle(
            "value", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=9,
            textColor=colors.black, spaceAfter=1 * mm,
        ),
        "footer": ParagraphStyle(
            "footer", parent=base["Normal"],
            fontName="Helvetica", fontSize=7,
            textColor=TEXT_GREY, alignment=TA_CENTER,
        ),
    }
    return custom


def _repayment_label(ls: dict) -> str:
    rt = ls.get("repayment_type", "")
    if rt == "principal_and_interest":
        return "Principal & Interest"
    label = "Interest Only"
    if ls.get("interest_only_years"):
        label += f" ({ls['interest_only_years']} yrs)"
    return label


def _rate_label(ls: dict) -> str:
    if ls.get("rate_type") == "fixed":
        rate = ls.get("fixed_rate_percent", "")
        yrs  = ls.get("fixed_period_years", "")
        return f"Fixed {rate}% for {yrs} yrs"
    return "Variable"


def _authorisation_block(idx: int, borrower: dict, auth: dict, s: dict):
    """Build a Customer Authorisation section for one borrower."""
    name = f"{borrower['given_names']} {borrower['surname']}"

    elems = []
    elems.append(Paragraph(f"Customer Authorisation ({name})", s["section"]))

    # Signature
    elems.append(Paragraph("Signature", s["label"]))
    try:
        elems.append(_sig_image(auth["signature_base64"]))
    except Exception:
        elems.append(Paragraph("[Signature not available]", s["label"]))
    elems.append(Spacer(1, 2 * mm))

    # Contact + date in a 3-column table
    contact_data = [
        ["Home Contact", "Work Contact", "Date"],
        [
            auth.get("home_contact") or "—",
            auth.get("work_contact") or "—",
            str(auth["signed_date"]),
        ],
    ]
    ct = Table(contact_data, colWidths=[55 * mm, 55 * mm, 50 * mm])
    ct.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica"),
        ("FONTNAME",      (0, 1), (-1, 1),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  TEXT_GREY),
        ("TEXTCOLOR",     (0, 1), (-1, 1),  colors.black),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.3, BORDER_GREY),
    ]))
    elems.append(ct)
    elems.append(Spacer(1, 3 * mm))
    return elems


def _page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(TEXT_GREY)
    txt = "WLTH-V1.1  |  Product Switch Request  |  Australian Credit Licence 525752"
    canvas.drawCentredString(PAGE_W / 2, 12 * mm, txt)
    canvas.drawRightString(PAGE_W - 20 * mm, 12 * mm, f"P{doc.page}")
    canvas.restoreState()


# ── Main entry point ─────────────────────────────────────────────────────────

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

    # ── LOGO + TITLE ──────────────────────────────────────────────────────
    story.append(Paragraph("WLTH", s["logo"]))
    story.append(Spacer(1, 2 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=WLTH_DARK, spaceAfter=3 * mm))

    story.append(Paragraph("Product Switch Request", s["title"]))
    story.append(Paragraph("Switch the product type on your existing WLTH loan(s)", s["subtitle"]))

    # ── AUTHORISATION PARAGRAPH ───────────────────────────────────────────
    story.append(Paragraph(
        "I/We request that WLTH Lend Pty Ltd switch the product on the loan(s) listed below. "
        "I/We understand that this form does not guarantee the requested product switch will be approved "
        "and I/we will accept the final decision of WLTH Lend Pty Ltd. "
        "I/We acknowledge that fees, including break costs or rate-lock fees, may be applicable "
        "in accordance with my/our loan contract.",
        s["body"],
    ))
    story.append(Spacer(1, 1 * mm))

    # ── BORROWERS ─────────────────────────────────────────────────────────
    story.append(Paragraph("Borrower(s)", s["section"]))
    borrowers = data.get("borrowers", [])
    bor_table_data = [["", "Surname", "Given Name(s)"]]
    for i, b in enumerate(borrowers):
        bor_table_data.append([
            f"Borrower {i + 1}",
            b["surname"],
            b["given_names"],
        ])
    bt = Table(bor_table_data, colWidths=[30 * mm, 60 * mm, 70 * mm])
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

    # ── LOAN SWITCHES TABLE ───────────────────────────────────────────────
    story.append(Paragraph("Loan Switch Details", s["section"]))
    switches = data.get("loan_switches", [])

    sw_table_data = [["Loan Account Number", "Repayment Type", "Rate Type"]]
    for ls in switches:
        sw_table_data.append([
            ls["loan_account_number"],
            _repayment_label(ls),
            _rate_label(ls),
        ])

    swt = Table(sw_table_data, colWidths=[60 * mm, 55 * mm, 45 * mm])
    swt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  LIGHT_GREY),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  WLTH_DARK),
        ("TEXTCOLOR",     (0, 1), (-1, -1), colors.black),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("GRID",          (0, 0), (-1, -1), 0.3, BORDER_GREY),
    ]))
    story.append(swt)
    story.append(Spacer(1, 3 * mm))

    # ── REASON FOR REQUEST ────────────────────────────────────────────────
    reason = data.get("reason_for_request")
    if reason:
        story.append(Paragraph("Reason for Request", s["section"]))
        reason_data = [["", reason]]
        rt = Table(reason_data, colWidths=[0, 160 * mm])
        rt.setStyle(TableStyle([
            ("FONTNAME",      (1, 0), (1, 0),  "Helvetica"),
            ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
            ("TEXTCOLOR",     (1, 0), (1, 0),  colors.black),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",    (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LINEBELOW",     (0, 0), (-1, -1), 0.3, BORDER_GREY),
        ]))
        story.append(rt)
        story.append(Spacer(1, 3 * mm))

    # ── AUTHORISATION TEXT ────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_GREY, spaceAfter=3 * mm))
    story.append(Paragraph("Customer Authorisation", s["section"]))
    story.append(Paragraph(
        "I/we authorise the above product switch and confirm that the information provided "
        "is accurate and complete. I/we acknowledge that break costs or other fees may apply.",
        s["body"],
    ))
    story.append(Spacer(1, 2 * mm))

    # ── SIGNATURES ────────────────────────────────────────────────────────
    authorisations = data.get("authorisations", [])
    for i, (borrower, auth) in enumerate(zip(borrowers, authorisations)):
        for elem in _authorisation_block(i, borrower, auth, s):
            story.append(elem)

    doc.build(story, onFirstPage=_page_footer, onLaterPages=_page_footer)
    return buffer.getvalue()
