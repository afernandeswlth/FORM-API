import io
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Table, TableStyle,
    Spacer, Image, HRFlowable, PageBreak,
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
        "terms_h1": ParagraphStyle(
            "terms_h1", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=11,
            textColor=WLTH_DARK, spaceBefore=3 * mm, spaceAfter=2 * mm,
        ),
        "terms_h2": ParagraphStyle(
            "terms_h2", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=9,
            textColor=WLTH_DARK, spaceBefore=3 * mm, spaceAfter=1 * mm,
        ),
        "terms_body": ParagraphStyle(
            "terms_body", parent=base["Normal"],
            fontName="Helvetica", fontSize=8.5,
            textColor=colors.black, leading=12, spaceAfter=1.5 * mm,
            alignment=TA_JUSTIFY,
        ),
        "bullet": ParagraphStyle(
            "bullet", parent=base["Normal"],
            fontName="Helvetica", fontSize=8.5,
            textColor=colors.black, leading=12, spaceAfter=1 * mm,
            leftIndent=10, firstLineIndent=-6,
        ),
    }
    return custom


def _field_table(rows, col_widths=None):
    """Render a list of (label, value) pairs in a bordered table."""
    tdata = []
    for label, value in rows:
        tdata.append([label, value if value else ""])

    if col_widths is None:
        col_widths = [50 * mm, 100 * mm]

    t = Table(tdata, colWidths=col_widths, repeatRows=0)
    t.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica"),
        ("FONTNAME",      (1, 0), (1, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR",     (0, 0), (0, -1), TEXT_GREY),
        ("TEXTCOLOR",     (1, 0), (1, -1), colors.black),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.3, BORDER_GREY),
    ]))
    return t


def _freq_label(freq: str) -> str:
    return {"weekly": "Weekly", "fortnightly": "Fortnightly", "monthly": "Monthly"}.get(
        freq, freq.title()
    )


def _amount_label(account: dict) -> str:
    amt_type = account.get("amount_type", "minimum")
    if amt_type == "other":
        amt = account.get("amount_other")
        return f"${amt:,.2f}" if amt is not None else "Other (unspecified)"
    return "Minimum Required"


def _debit_account_block(idx: int, account: dict, s: dict, total: int):
    """Build a single debit-account section."""
    label = f"Debit Account {idx}" if total > 1 else "Debit Account"
    rows = [Paragraph(label, s["section"])]
    rows.append(_field_table([
        ("Financial Institution",    account["financial_institution"]),
        ("Branch",                   account["branch"]),
        ("Account Holders / Title",  account["account_holders"]),
        ("BSB No.",                  account["bsb_number"]),
        ("Account No.",              account["account_number"]),
        ("Payment Frequency",        _freq_label(account.get("payment_frequency", ""))),
        ("Repayment Amount",         _amount_label(account)),
        ("Bank Statement",           account.get("bank_statement_filename", "")),
    ], col_widths=[55 * mm, 105 * mm]))
    rows.append(Spacer(1, 3 * mm))
    return rows


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
    txt = (
        "WLTH-V1.0  |  Direct Debit Request Form  |  Direct Debit ID No. 460095  |  "
        "Australian Credit Licence 525752  |  13WLTH  |  hello@wlth.com"
    )
    canvas.drawCentredString(PAGE_W / 2, 12 * mm, txt)
    canvas.drawRightString(PAGE_W - 20 * mm, 12 * mm, f"P{doc.page} / 2")
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

    story.append(Paragraph("Direct Debit Request", s["title"]))
    story.append(Paragraph("Set up a new direct debit", s["subtitle"]))

    # ── INTRO TEXT ────────────────────────────────────────────────────────
    story.append(Paragraph(
        "I/We authorise and request you setup my/our direct debit arrangement as described below. "
        "Repayments may be debited through the Bulk Electronic Clearing System (BECS) from my/our "
        "nominated account conducted at the financial institution identified below in connection with "
        "my/our mortgage loan with WLTH. <b>Direct Debit ID No. 460095</b>",
        s["body"],
    ))
    story.append(Spacer(1, 1 * mm))

    # ── LOAN ACCOUNT NUMBER ───────────────────────────────────────────────
    story.append(Paragraph("Loan Details", s["section"]))
    story.append(_field_table([
        ("Loan Account No.", data.get("loan_account_number", "")),
    ], col_widths=[55 * mm, 105 * mm]))
    story.append(Spacer(1, 3 * mm))

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

    # ── DEBIT ACCOUNTS ────────────────────────────────────────────────────
    story.append(Paragraph("Nominated Debit Account(s)", s["section"]))
    debit_accounts = data.get("debit_accounts", [])
    total = len(debit_accounts)

    for i, acc in enumerate(debit_accounts):
        for elem in _debit_account_block(i + 1, acc, s, total):
            story.append(elem)

    # ── COMMENTS ─────────────────────────────────────────────────────────
    comments = data.get("comments")
    if comments:
        story.append(Paragraph("Comments", s["section"]))
        story.append(_field_table([("", comments)], col_widths=[0, 160 * mm]))
        story.append(Spacer(1, 3 * mm))

    # ── AUTHORISATION TEXT ────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_GREY, spaceAfter=3 * mm))
    story.append(Paragraph("Customer Authorisation", s["section"]))
    story.append(Paragraph(
        "I/we, request WLTH to set up the above direct debit arrangement in connection with "
        "my/our WLTH mortgage loan and acknowledge that this direct debit arrangement is governed "
        "by the terms of the Client Service Agreement overleaf. "
        "(NB: Direct debiting is not available on the full range of accounts. If in doubt please "
        "refer to your Financial Institution).",
        s["body"],
    ))
    story.append(Spacer(1, 2 * mm))

    # ── SIGNATURES ────────────────────────────────────────────────────────
    authorisations = data.get("authorisations", [])
    for i, (borrower, auth) in enumerate(zip(borrowers, authorisations)):
        for elem in _authorisation_block(i, borrower, auth, s):
            story.append(elem)

    # ── PAGE 2: TERMS ─────────────────────────────────────────────────────
    story.append(PageBreak())
    _build_terms_page(story, s)

    doc.build(story, onFirstPage=_page_footer, onLaterPages=_page_footer)
    return buffer.getvalue()


def _build_terms_page(story: list, s: dict) -> None:
    story.append(Paragraph("WLTH", s["logo"]))
    story.append(Spacer(1, 2 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=WLTH_DARK, spaceAfter=3 * mm))
    story.append(Paragraph("Direct Debit Request", s["terms_h1"]))
    story.append(Paragraph("(Direct Debit Request — Terms of Use)", s["subtitle"]))
    story.append(Paragraph("Client Service Agreement", s["terms_h1"]))
    story.append(Paragraph(
        "This document provides information to you regarding the direct debiting of your account. "
        "By signing the Direct Debit Request (DDR) you acknowledge you have read and understood "
        "these terms.",
        s["terms_body"],
    ))

    def h2(text):
        story.append(Paragraph(text, s["terms_h2"]))

    def body(text):
        story.append(Paragraph(text, s["terms_body"]))

    def bullet(text):
        story.append(Paragraph(f"• {text}", s["bullet"]))

    h2("How the DDR will be used")
    bullet("The DDR will be used to debit amounts due by you under your loan agreement with the lender.")
    bullet(
        "Where a payment due date falls on a non-business day, the amount will be debited on the next "
        "business day. If you are uncertain as to when the debit will be processed to your account you "
        "should contact the financial institution at which you maintain this account."
    )
    bullet("The purpose for which the DDR is used will not be changed without giving you at least 14 days notice and without your prior approval.")
    bullet("All information relating to your nominated account will be kept private.")
    bullet(
        "We will advise you, in writing, the details of the DDR agreement (amount, frequency, "
        "commencement date) at least 5 calendar days prior to the first direct debit."
    )
    bullet(
        "We reserve the right to cancel the DDR if three or more direct debits are returned unpaid "
        "by your nominated Financial Institution. If this occurs an alternative payment method must be arranged."
    )

    h2("Your rights")
    bullet(
        "You may not terminate the DDR without WLTH's consent. You may terminate the DDR at any time "
        "by giving written notice directly to us, or through your Financial Institution. Notice sent to "
        "us should be received at least 14 business days prior to the date of termination."
    )
    bullet(
        "You may stop any individual debit by giving written notice to WLTH. This notice must be "
        "received by WLTH at least 5 business days prior to the payment due date."
    )
    bullet(
        "You may request deferment or alteration to payments under the DDR by contacting WLTH. "
        "Any request must be given at least 5 business days prior to the payment due date."
    )
    bullet(
        "If you consider that a debit has been incorrectly made, you should contact WLTH or lodge a "
        "direct debit claim through your Financial Institution. WLTH will determine whether the debit "
        "was correct, and if not, arrange for an adjustment."
    )
    bullet("If WLTH determines that the debit was correct, you will be told why.")

    h2("Your commitment to us")
    bullet(
        "You must ensure there are sufficient clear funds available in the nominated account to meet "
        "each debit on its due date. It is your responsibility to advise us if the account nominated "
        "by you to receive the DDR is transferred or closed."
    )
    bullet(
        "It is your responsibility to arrange with us a suitable alternate payment method if you wish "
        "to cancel the DDR."
    )
    bullet(
        "You must ensure that the account you propose to debit allows direct debits. You should check "
        "this directly with the Financial Institution at which you maintain the account."
    )
    bullet(
        "You will not close or alter the account without the mortgage manager's prior written consent "
        "and unless approved alternate payment arrangements have been made."
    )
    bullet(
        "If a payment is dishonoured, you may be charged fees by your Financial Institution, you may "
        "incur fees under your credit contract, and you may be in default under your credit contract."
    )
    bullet(
        "If you nominate a payment amount, you will need to nominate a new amount when/if the interest "
        "rate, and or, your required repayments change. You will need to ensure you are always meeting "
        "the minimum repayment."
    )
