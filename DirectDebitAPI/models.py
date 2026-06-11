from pydantic import BaseModel, Field, model_validator, field_validator
from typing import List, Optional
from datetime import date
from enum import Enum
import re


class PaymentFrequency(str, Enum):
    WEEKLY = "weekly"
    FORTNIGHTLY = "fortnightly"
    MONTHLY = "monthly"


class AmountType(str, Enum):
    MINIMUM = "minimum"
    OTHER = "other"


class Borrower(BaseModel):
    surname: str = Field(..., min_length=1, max_length=100)
    given_names: str = Field(..., min_length=1, max_length=100)


class DebitAccount(BaseModel):
    financial_institution: str = Field(..., min_length=1, max_length=100)
    branch: str = Field(..., min_length=1, max_length=100)
    account_holders: str = Field(
        ..., min_length=1, max_length=200,
        description="Account holders name(s) or account title"
    )
    bsb_number: str = Field(..., description="BSB number in format XXX-XXX")
    account_number: str = Field(..., description="Bank account number (digits only)")
    payment_frequency: PaymentFrequency = Field(..., description="How often the direct debit will occur")
    amount_type: AmountType = Field(..., description="'minimum' for minimum required repayment, 'other' for a specified amount")
    amount_other: Optional[float] = Field(None, description="Specified debit amount (required when amount_type is 'other')")
    bank_statement_base64: str = Field(..., description="Base64-encoded bank statement (data URI, PDF or image)")
    bank_statement_filename: str = Field(..., min_length=1, max_length=255, description="Original filename of the bank statement")

    @field_validator("bsb_number")
    @classmethod
    def validate_bsb(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) != 6:
            raise ValueError("BSB must be exactly 6 digits (e.g. 123-456)")
        return f"{digits[:3]}-{digits[3:]}"

    @field_validator("account_number")
    @classmethod
    def validate_account_number(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) < 4 or len(digits) > 12:
            raise ValueError("Account number must be 4–12 digits")
        return digits

    @model_validator(mode="after")
    def validate_amount_other(self) -> "DebitAccount":
        if self.amount_type == AmountType.OTHER:
            if self.amount_other is None:
                raise ValueError("amount_other is required when amount_type is 'other'")
            if self.amount_other <= 0:
                raise ValueError("amount_other must be greater than 0")
        return self


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


class DirectDebitSubmission(BaseModel):
    loan_account_number: str = Field(..., min_length=1, max_length=50)
    borrowers: List[Borrower] = Field(..., min_length=1, max_length=4)
    debit_accounts: List[DebitAccount] = Field(..., min_length=1, max_length=4)
    comments: Optional[str] = Field(None, max_length=500)
    authorisations: List[CustomerAuthorisation] = Field(
        ..., description="One authorisation per borrower"
    )

    @model_validator(mode="after")
    def validate_consistency(self) -> "DirectDebitSubmission":
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
    loan_account_number: str
    borrower_count: int
    account_count: int
