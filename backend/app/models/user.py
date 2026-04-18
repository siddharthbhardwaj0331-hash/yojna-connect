"""
User Models
============
Pydantic models for request validation and response serialization.
FastAPI uses these to auto-validate incoming JSON and generate OpenAPI docs.
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator
from enum import Enum


# ─── Enums for Controlled Vocabulary ──────────────────────────────────────────

class CategoryEnum(str, Enum):
    """Social category of the user."""
    general = "general"
    sc = "SC"
    st = "ST"
    obc = "OBC"
    ews = "EWS"
    minority = "minority"
    women = "women"
    bpl = "BPL"


class OccupationEnum(str, Enum):
    """Primary occupation of the user."""
    student = "student"
    farmer = "farmer"
    labour = "labour"
    self_employed = "self-employed"
    businessman = "businessman"
    salaried = "salaried"
    unemployed = "unemployed"
    vendor = "vendor"
    entrepreneur = "entrepreneur"
    other = "other"


# ─── Request Model ─────────────────────────────────────────────────────────────

class UserProfileRequest(BaseModel):
    """
    Request body for POST /user/profile
    All fields are validated by Pydantic before hitting the route handler.
    """
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    age: int = Field(..., ge=0, le=120, description="Age in years (0–120)")
    annual_income: float = Field(..., ge=0, description="Annual household income in INR")
    occupation: OccupationEnum = Field(..., description="Primary occupation")
    state: str = Field(..., min_length=2, max_length=50, description="Indian state of residence")
    category: CategoryEnum = Field(..., description="Social category (General/SC/ST/OBC/EWS/etc.)")
    gender: Optional[str] = Field(None, description="Gender (optional)")
    is_bpl: Optional[bool] = Field(False, description="Whether family holds BPL card")
    has_land: Optional[bool] = Field(False, description="Whether user owns agricultural land")

    @field_validator("state")
    @classmethod
    def capitalize_state(cls, v: str) -> str:
        """Normalize state names to title case (e.g., 'uttar pradesh' → 'Uttar Pradesh')."""
        return v.strip().title()

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Ramesh Kumar",
                "age": 35,
                "annual_income": 180000,
                "occupation": "farmer",
                "state": "Uttar Pradesh",
                "category": "OBC",
                "gender": "male",
                "is_bpl": True,
                "has_land": True,
            }
        }
    }


# ─── Response Models ───────────────────────────────────────────────────────────

class UserProfileResponse(BaseModel):
    """Response returned after saving a user profile."""
    id: str
    name: str
    age: int
    annual_income: float
    occupation: str
    state: str
    category: str
    message: str = "Profile saved successfully"
