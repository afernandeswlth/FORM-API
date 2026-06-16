import logging
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from typing import List

from pathlib import Path
from .models import RepaymentChangeSubmission, SubmissionResponse, SubmissionSummary
from .storage import create_submission, get_submission, list_submissions, delete_submission
from .pdf_generator import generate_pdf
from .email_sender import send_submission_email
from .thread_store import get_thread_message_id, save_thread_message_id

BASE_DIR = Path(__file__).parent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="WLTH Repayment Change API",
    version="1.0.0",
    description=(
        "Digitised submission API for the WLTH Repayment Change Form. "
        "Accepts form data, stores submissions, and generates filled PDF documents."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="repayment-change-static")


@app.get("/", include_in_schema=False)
def root():
    return FileResponse(str(BASE_DIR / "static" / "index.html"))


# ── Submissions ───────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/submissions",
    response_model=SubmissionResponse,
    summary="Submit a Repayment Change Request form",
    status_code=201,
)
def submit_form(body: RepaymentChangeSubmission):
    submission_id = create_submission(body.model_dump(mode="json"))

    # Send email — best-effort, never fail the API response over it
    try:
        sub       = get_submission(submission_id)
        pdf_bytes = generate_pdf(sub["data"])
        loan_no   = body.repayment_changes[0].loan_account_number
        reply_to  = get_thread_message_id(loan_no)
        msg_id    = send_submission_email(submission_id, sub["data"], pdf_bytes, reply_to)
        # Only save the message ID for the very first submission on this loan account
        if not reply_to:
            save_thread_message_id(loan_no, msg_id)
    except Exception as exc:
        logger.warning("Email send failed for submission %s: %s", submission_id, exc)

    return SubmissionResponse(
        id=submission_id,
        status="submitted",
        created_at=datetime.now(timezone.utc).isoformat(),
        pdf_url=f"/api/v1/submissions/{submission_id}/pdf",
    )


@app.get(
    "/api/v1/submissions",
    response_model=List[SubmissionSummary],
    summary="List all submissions (admin)",
)
def list_all():
    return list_submissions()


@app.get(
    "/api/v1/submissions/{submission_id}",
    summary="Retrieve a single submission",
)
def get_one(submission_id: str):
    sub = get_submission(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub


@app.get(
    "/api/v1/submissions/{submission_id}/pdf",
    summary="Download the generated PDF for a submission",
    responses={200: {"content": {"application/pdf": {}}}},
)
def download_pdf(submission_id: str):
    sub = get_submission(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    try:
        pdf_bytes = generate_pdf(sub["data"])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}")

    filename = f"wlth_repayment_change_{submission_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.delete(
    "/api/v1/submissions/{submission_id}",
    summary="Delete a submission",
    status_code=204,
)
def delete_one(submission_id: str):
    if not delete_submission(submission_id):
        raise HTTPException(status_code=404, detail="Submission not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
