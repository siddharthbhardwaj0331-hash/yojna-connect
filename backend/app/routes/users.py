"""
User Routes
============
Handles all /user/* API endpoints.
"""

from fastapi import APIRouter, HTTPException, status

from app.models.user import UserProfileRequest, UserProfileResponse
from app.services.user_service import user_service
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# APIRouter groups all user-related routes under /user prefix (set in main.py)
router = APIRouter()


@router.post(
    "/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save User Profile",
    description="Save a new user profile with demographic and income information.",
)
async def save_user_profile(profile: UserProfileRequest):
    """
    **POST /api/user/profile**

    Saves user's profile data to MongoDB.
    This profile is used to recommend relevant government schemes.

    - **name**: Full name of the user
    - **age**: Age in years
    - **annual_income**: Total annual household income in INR
    - **occupation**: Primary occupation
    - **state**: Indian state of residence
    - **category**: Social category (SC/ST/OBC/General/EWS/etc.)
    """
    try:
        logger.info(f"📥 Saving profile for user: {profile.name}")

        # Convert Pydantic model to plain dict for MongoDB insertion
        profile_data = profile.model_dump()

        saved = await user_service.save_profile(profile_data)

        return UserProfileResponse(
            id=saved["id"],
            name=saved["name"],
            age=saved["age"],
            annual_income=saved["annual_income"],
            occupation=saved["occupation"],
            state=saved["state"],
            category=saved["category"],
            message=f"✅ {saved['name']} का प्रोफ़ाइल सफलतापूर्वक सहेजा गया!",
        )

    except Exception as e:
        logger.error(f"❌ Error saving user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile save failed: {str(e)}",
        )
