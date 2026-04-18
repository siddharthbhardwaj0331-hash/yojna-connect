from pydantic import BaseModel, Field
from typing import List, Optional


class RecommendationRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    age: int = Field(..., ge=1, le=120)
    annual_income: float = Field(..., ge=0)
    occupation: str
    state: str
    category: str
    gender: Optional[str] = None
    is_bpl: bool = False
    has_land: bool = False


class RecommendedScheme(BaseModel):
    name: str
    reason: str
    benefits: str
    eligibility: str
    apply_link: str


class RecommendationResponse(BaseModel):
    user_name: str
    total_schemes_found: int
    recommended_schemes: List[RecommendedScheme]
    ai_summary: str