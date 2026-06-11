from pydantic import BaseModel, Field, model_validator, field_validator
from typing import List, Optional
from datetime import date
from enum import Enum
import re


class FormType(str, Enum):
    SINGLE = "single"
    MULTIPLE = "multiple"


class Borrower(BaseModel):
    surname: str = Field(..., min_length=1, max_length=100)
    given_names: str = Field(..., min_length=1, max_length=100)


class LinkedAccount(BaseModel):
    financial_institution: str = Field(..., min_length=1, max_length=100)
    branch: str = Field(..., min_length=1, max_length=100)
    account_holders: str = Field(
        ..., min_length=1, max_length=200,
        description="Account holders name(s) or account title"
    )
    bsb_number: str = Field(..., description="BSB number in format XXX-XXX")
    account_number: str = Field(..., description="Bank account number (digits only)")
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


class LinkedAccountSubmission(BaseModel):
    form_type: FormType = Field(
        ..., description="'single' for one account, 'multiple' for up to 4 accounts"
    )
    loan_account_number: str = Field(..., min_length=1, max_length=50)
    borrowers: List[Borrower] = Field(..., min_length=1, max_length=4)
    linked_accounts: List[LinkedAccount] = Field(..., min_length=1, max_length=4)
    comments: Optional[str] = Field(None, max_length=500)
    authorisations: List[CustomerAuthorisation] = Field(
        ..., description="One authorisation per borrower"
    )

    @model_validator(mode="after")
    def validate_consistency(self) -> "LinkedAccountSubmission":
        if len(self.authorisations) != len(self.borrowers):
            raise ValueError("Number of authorisations must match number of borrowers")
        if self.form_type == FormType.SINGLE and len(self.linked_accounts) > 1:
            raise ValueError("Single-account form can only have one linked account")
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
    form_type: str
    loan_account_number: str
    borrower_count: int
    account_count: int
