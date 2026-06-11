from pydantic import BaseModel, Field, model_validator, field_validator
from typing import List, Optional
from datetime import date
from enum import Enum
import re


class PaymentFrequency(str, Enum):
    WEEKLY = "weekly"
    FORTNIGHTLY = "fortnightly"
    MONTHLY = "monthly"


class Borrower(BaseModel):
    surname: str = Field(..., min_length=1, max_length=100)
    given_names: str = Field(..., min_length=1, max_length=100)


class RepaymentChange(BaseModel):
    loan_account_number: str = Field(..., min_length=1, max_length=50)
    new_amount: float = Field(..., gt=0, description="New repayment amount in AUD")
    frequency: PaymentFrequency


class CustomerAuthorisation(BaseModel):
    signature_base64: str = Field(
        ...,
        description="Base64-encoded PNG signature (raw base64 or data URI)"
    )
    home_contact: Optional[str] = Field(None, max_length=20, description="Home phone number")
    work_contact: Optional[str] = Field(None, max_length=20, description="Work phone number")
    signed_date: date = Field(..., description="Date of signing")

    @field_validator("home_contact", "work_contact")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = re.sub(r"[\s\-\(\)\+]", "", v)
        if not cleaned.isdigit() or len(cleaned) < 8:
            raise ValueError("Please provide a valid phone number (at least 8 digits)")
        return v


class RepaymentChangeSubmission(BaseModel):
    borrowers: List[Borrower] = Field(..., min_length=1, max_length=4)
    repayment_changes: List[RepaymentChange] = Field(..., min_length=1, max_length=4)
    comments: Optional[str] = Field(None, max_length=500)
    authorisations: List[CustomerAuthorisation] = Field(
        ..., description="One authorisation per borrower"
    )

    @model_validator(mode="after")
    def validate_consistency(self) -> "RepaymentChangeSubmission":
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
