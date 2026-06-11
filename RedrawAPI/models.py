from pydantic import BaseModel, Field, model_validator, field_validator
from typing import List, Optional
from datetime import date
import re


class Borrower(BaseModel):
    surname: str = Field(..., min_length=1, max_length=100)
    given_names: str = Field(..., min_length=1, max_length=100)


class RedrawDestination(BaseModel):
    to_account_name: str = Field(..., min_length=1, max_length=100, description="Name on destination account")
    bsb: str = Field(..., description="BSB number (6 digits, with or without hyphen)")
    account_number: str = Field(..., min_length=1, max_length=20, description="Destination account number")
    redraw_amount: float = Field(..., gt=0, description="Redraw amount in AUD")
    large_amount: bool = Field(False, description="True if amount is $100,000 or more")

    @field_validator("bsb")
    @classmethod
    def validate_bsb(cls, v: str) -> str:
        digits = v.replace("-", "").replace(" ", "")
        if not digits.isdigit() or len(digits) != 6:
            raise ValueError("BSB must be exactly 6 digits (e.g. 062-000)")
        return f"{digits[:3]}-{digits[3:]}"

    @field_validator("account_number")
    @classmethod
    def validate_account_number(cls, v: str) -> str:
        cleaned = v.replace(" ", "").replace("-", "")
        if not cleaned.isdigit():
            raise ValueError("Account number must contain digits only")
        return cleaned


class CustomerAuthorisation(BaseModel):
    signature_base64: str = Field(..., description="Base64-encoded PNG signature (raw or data URI)")
    signed_date: date = Field(..., description="Date of signing")


class RedrawSubmission(BaseModel):
    borrowers: List[Borrower] = Field(..., min_length=1, max_length=4)
    loan_account_number: str = Field(..., min_length=1, max_length=50)
    redraw_destination: RedrawDestination
    redraw_reason: str = Field(..., min_length=1, max_length=2000, description="What the funds will be used for")
    authorisations: List[CustomerAuthorisation] = Field(..., description="One authorisation per borrower")

    @model_validator(mode="after")
    def validate_consistency(self) -> "RedrawSubmission":
        if len(self.authorisations) != len(self.borrowers):
            raise ValueError("Number of authorisations must match number of borrowers")
        return self


class SubmissionResponse(BaseModel):
    id: str
    status: str
    created_at: str
    message: str = "Form submitted successfully"
    pdf_url: str


class SubmissionSummary(BaseModel):
    id: str
    status: str
    created_at: str
    borrower_count: int
    account_count: int
