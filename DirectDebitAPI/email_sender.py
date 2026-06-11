import os
import smtplib
import logging
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.utils import make_msgid, formatdate, formataddr
from typing import Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.office365.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_NAME = os.getenv("FROM_NAME", "WLTH Forms")
FROM_ADDR = os.getenv("FROM_EMAIL", SMTP_USER)
TO_ADDR   = "a.fernandes@wlth.com"


def _freq_label(freq: str) -> str:
    return {"weekly": "Weekly", "fortnightly": "Fortnightly", "monthly": "Monthly"}.get(freq, freq.title())


def _amount_label(account: dict) -> str:
    amt_type = account.get("amount_type", "minimum")
    if amt_type == "other":
        amt = account.get("amount_other")
        return f"${amt:,.2f}" if amt is not None else "Other (unspecified)"
    return "Minimum Required"


def _email_body(data: dict, submission_id: str) -> str:
    borrowers = data.get("borrowers", [])
    names = ", ".join(f"{b['given_names']} {b['surname']}" for b in borrowers)
    accounts = data.get("debit_accounts", [])
    account_lines = "\n".join(
        f"  • {a['financial_institution']}  |  BSB {a['bsb_number']}  |  Account {a['account_number']}"
        f"  |  {_freq_label(a.get('payment_frequency', ''))}  |  {_amount_label(a)}"
        for a in accounts
    )
    submitted_at = datetime.now(timezone.utc).strftime("%d %b %Y at %H:%M UTC")
    comments = data.get("comments") or "—"

    return (
        f"A new Direct Debit Request has been submitted.\n"
        f"\n"
        f"Submission ID:     {submission_id}\n"
        f"Submitted:         {submitted_at}\n"
        f"Loan Account No.:  {data.get('loan_account_number', '')}\n"
        f"Borrower(s):       {names}\n"
        f"\n"
        f"Nominated debit account(s):\n"
        f"{account_lines}\n"
        f"\n"
        f"Comments: {comments}\n"
        f"\n"
        f"Attachments:\n"
        f"  • Completed form PDF\n"
        f"\n"
        f"--\n"
        f"WLTH Direct Debit Request System\n"
    )


def send_submission_email(
    submission_id: str,
    data: dict,
    pdf_bytes: bytes,
    reply_to_message_id: Optional[str] = None,
) -> str:
    """
    Send the submission PDF to the nominated address.

    Pass reply_to_message_id to thread this email under a previous submission
    for the same loan account. Returns the Message-ID of the sent email.
    Raises RuntimeError/SMTPException on failure.
    """
    if not SMTP_USER or not SMTP_PASS:
        raise RuntimeError(
            "Email not configured. Set SMTP_USER and SMTP_PASS in your .env file."
        )

    loan_no = data.get("loan_account_number", "Unknown")
    base_subject = f"Direct Debit Request – Loan {loan_no}"
    subject = f"Re: {base_subject}" if reply_to_message_id else base_subject

    domain = FROM_ADDR.split("@")[-1] if "@" in FROM_ADDR else "wlth.com"
    msg_id = make_msgid(domain=domain)

    msg = MIMEMultipart("mixed")
    msg["From"]       = formataddr((FROM_NAME, FROM_ADDR))
    msg["To"]         = TO_ADDR
    msg["Subject"]    = subject
    msg["Date"]       = formatdate(localtime=False)
    msg["Message-ID"] = msg_id

    if reply_to_message_id:
        msg["In-Reply-To"] = reply_to_message_id
        msg["References"]  = reply_to_message_id

    msg.attach(MIMEText(_email_body(data, submission_id), "plain", "utf-8"))

    # Attach the completed form PDF
    pdf_part = MIMEApplication(pdf_bytes, _subtype="pdf")
    pdf_part.add_header(
        "Content-Disposition", "attachment",
        filename=f"wlth_direct_debit_{submission_id[:8]}.pdf",
    )
    msg.attach(pdf_part)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASS)
        smtp.sendmail(FROM_ADDR, [TO_ADDR], msg.as_string())

    logger.info(
        "Email sent  submission=%s  loan=%s  reply=%s  msg_id=%s",
        submission_id, loan_no, bool(reply_to_message_id), msg_id,
    )
    return msg_id
