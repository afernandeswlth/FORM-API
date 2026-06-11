from pydantic import BaseModel, Field, model_validator, field_validator
from typing import List, Optional
from datetime import date
from enum import Enum
import re


class RepaymentType(str, Enum):
    PRINCIPAL_AND_INTEREST = "principal_and_interest"
    INTEREST_ONLY = "interest_only"


class RateType(str, Enum):
    VARIABLE = "variable"
    FIXED = "fixed"


class Borrower(BaseModel):
    surname: str = Field(..., min_length=1, max_length=100)
    given_names: str = Field(..., min_length=1, max_length=100)


class LoanSwitch(BaseModel):
    loan_account_number: str = Field(..., min_length=1, max_length=50)
    repayment_type: RepaymentType
    interest_only_years: Optional[int] = Field(
        None, ge=1,
        description="IO term in years (required if repayment_type=interest_only)"
    )
    rate_type: RateType
    fixed_rate_percent: Optional[float] = Field(
        None, gt=0,
        description="Fixed interest rate % (required if rate_type=fixed)"
    )
    fixed_period_years: Optional[int] = Field(
        None, ge=1,
        description="Fixed period in years (required if rate_type=fixed)"
    )

    @model_validator(mode="after")
    def validate_conditional_fields(self):
        if self.repayment_type == RepaymentType.INTEREST_ONLY and self.interest_only_years is None:
            raise ValueError("interest_only_years is required when repayment_type is interest_only")
        if self.rate_type == RateType.FIXED:
            if self.fixed_rate_percent is None:
                raise ValueError("fixed_rate_percent is required when rate_type is fixed")
            if self.fixed_period_years is None:
                raise ValueError("fixed_period_years is required when rate_type is fixed")
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


class ProductSwitchSubmission(BaseModel):
    borrowers: List[Borrower] = Field(..., min_length=1, max_length=4)
    loan_switches: List[LoanSwitch] = Field(..., min_length=1, max_length=3)
    reason_for_request: Optional[str] = Field(None, max_length=1000)
    authorisations: List[CustomerAuthorisation] = Field(
        ..., description="One authorisation per borrower"
    )

    @model_validator(mode="after")
    def validate_consistency(self) -> "ProductSwitchSubmission":
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
