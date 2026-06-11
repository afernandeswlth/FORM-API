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


def _email_body(data: dict, submission_id: str) -> str:
    borrowers = data.get("borrowers", [])
    names = ", ".join(f"{b['given_names']} {b['surname']}" for b in borrowers)
    dest = data.get("redraw_destination", {})
    submitted_at = datetime.now(timezone.utc).strftime("%d %b %Y at %H:%M UTC")
    large_flag = "  ⚠️  $100,000 OR MORE – REFER TO WLTH" if dest.get("large_amount") else ""

    return (
        f"A new Redraw Request has been submitted.\n"
        f"\n"
        f"Submission ID:   {submission_id}\n"
        f"Submitted:       {submitted_at}\n"
        f"Borrower(s):     {names}\n"
        f"Loan Account:    {data.get('loan_account_number', '—')}\n"
        f"\n"
        f"Redraw Details:\n"
        f"  To Account:    {dest.get('to_account_name', '—')}\n"
        f"  BSB:           {dest.get('bsb', '—')}\n"
        f"  Account No.:   {dest.get('account_number', '—')}\n"
        f"  Amount:        ${dest.get('redraw_amount', 0):,.2f}{large_flag}\n"
        f"\n"
        f"Reason: {data.get('redraw_reason') or '—'}\n"
        f"\n"
        f"The completed form PDF is attached.\n"
        f"\n"
        f"--\n"
        f"WLTH Redraw Request System\n"
    )


def send_submission_email(
    submission_id: str,
    data: dict,
    pdf_bytes: bytes,
    reply_to_message_id: Optional[str] = None,
) -> str:
    if not SMTP_USER or not SMTP_PASS:
        raise RuntimeError("Email not configured. Set SMTP_USER and SMTP_PASS in your .env file.")

    borrowers = data.get("borrowers", [])
    names = ", ".join(f"{b['given_names']} {b['surname']}" for b in borrowers)
    base_subject = f"Redraw Request – {names}"
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

    pdf_part = MIMEApplication(pdf_bytes, _subtype="pdf")
    pdf_part.add_header(
        "Content-Disposition", "attachment",
        filename=f"wlth_redraw_request_{submission_id[:8]}.pdf",
    )
    msg.attach(pdf_part)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASS)
        smtp.sendmail(FROM_ADDR, [TO_ADDR], msg.as_string())

    logger.info("Email sent  submission=%s  msg_id=%s", submission_id, msg_id)
    return msg_id
