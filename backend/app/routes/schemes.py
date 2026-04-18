"""
Scheme Routes
==============
Handles `/api/schemes/*` endpoints (prefix set in `main.py`).
The `/api/schemes/recommend` endpoint is the core AI-powered feature.
"""

from fastapi import APIRouter, HTTPException, status

from app.models.scheme import RecommendationRequest, RecommendationResponse, RecommendedScheme
from app.services.scheme_service import scheme_service
from app.services.gemini_service import gemini_service
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()


# ─── POST .../recommend (declare before /{scheme_id} so "recommend" is not captured as an id) ─

@router.post(
    "/recommend",
    response_model=RecommendationResponse,
    summary="AI-Powered Scheme Recommendations",
    description=(
        "Hybrid recommendation engine: "
        "1) Filters schemes from MongoDB based on eligibility, "
        "2) Sends filtered schemes + user profile to Gemini AI, "
        "3) Returns ranked recommendations with personalized explanations in Hinglish."
    ),
)
async def recommend_schemes(user: RecommendationRequest):
    """
    **POST /api/schemes/recommend**

    The flagship endpoint of Yojna AI.

    **How it works (Hybrid AI Logic):**
    1. **DB Filter** → Query MongoDB for schemes matching age, income, category, occupation, state
    2. **Gemini AI** → Send filtered schemes + user profile to Gemini for ranking & explanation
    3. **Response** → Clean JSON with personalized recommendations in Hinglish

    **Example use case:** A 35-year-old OBC farmer from UP with ₹1.8L income gets
    schemes like PM Kisan, PM Awas Yojana (Gramin), Ayushman Bharat — ranked by relevance.
    """
    try:
        logger.info(f"🔎 Recommendation request for: {user.name} | {user.occupation} | {user.state}")

        user_profile = user.model_dump()

        filtered_schemes = await scheme_service.filter_eligible_schemes(user_profile)
        logger.info(f"📋 {len(filtered_schemes)} eligible schemes found in DB")

        recommended, ai_summary = await gemini_service.get_recommendations(
            user_profile, filtered_schemes
        )

        parsed_schemes = []
        for item in recommended:
            if not isinstance(item, dict):
                logger.warning("Skipping non-object scheme entry from AI: %r", item)
                continue
            try:
                parsed_schemes.append(
                    RecommendedScheme(
                        name=item.get("name", ""),
                        reason=item.get("reason", ""),
                        benefits=item.get("benefits", ""),
                        eligibility=item.get("eligibility", ""),
                        apply_link=item.get("apply_link", "#"),
                    )
                )
            except Exception as parse_err:
                logger.warning(f"⚠️  Skipping malformed scheme item: {parse_err}")

        logger.info(f"✅ Returning {len(parsed_schemes)} recommendations for {user.name}")

        return RecommendationResponse(
            user_name=user.name,
            total_schemes_found=len(parsed_schemes),
            recommended_schemes=parsed_schemes,
            ai_summary=ai_summary,
        )

    except Exception as e:
        logger.error(f"❌ Recommendation error for {user.name}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation failed: {str(e)}",
        )


# ─── GET /schemes ──────────────────────────────────────────────────────────────

@router.get(
    "/",
    summary="List All Schemes",
    description="Returns all government schemes stored in the database.",
)
async def list_all_schemes():
    """
    **GET /api/schemes**

    Fetches and returns all government schemes from MongoDB.
    Useful for browsing the full catalogue.
    """
    try:
        schemes = await scheme_service.get_all_schemes()
        return {
            "total": len(schemes),
            "schemes": schemes,
        }
    except Exception as e:
        logger.error(f"❌ Error fetching schemes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch schemes: {str(e)}",
        )


# ─── GET /schemes/{id} ─────────────────────────────────────────────────────────

@router.get(
    "/{scheme_id}",
    summary="Get Scheme Details",
    description="Returns detailed information for a single scheme by its MongoDB ID.",
)
async def get_scheme_details(scheme_id: str):
    """
    **GET /api/schemes/{scheme_id}**

    Fetches a single scheme by its unique MongoDB ObjectId.
    Returns 404 if the scheme is not found or ID is invalid.
    """
    try:
        scheme = await scheme_service.get_scheme_by_id(scheme_id)
        if not scheme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scheme with ID '{scheme_id}' not found.",
            )
        return scheme
    except HTTPException:
        raise  # Re-raise 404 without wrapping it
    except Exception as e:
        logger.error(f"❌ Error fetching scheme {scheme_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch scheme: {str(e)}",
        )
