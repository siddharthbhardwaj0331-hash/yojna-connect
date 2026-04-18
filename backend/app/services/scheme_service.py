"""
Scheme Service
===============
Handles all database operations for the `schemes` collection.
Includes eligibility filtering logic that runs BEFORE calling Gemini.
"""

from typing import List, Optional
from bson import ObjectId

from app.database.mongodb import get_database
from app.utils.helpers import serialize_doc, serialize_docs, is_valid_object_id
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class SchemeService:
    """
    All MongoDB operations for the `schemes` collection.
    The `filter_eligible_schemes` method is the core of the hybrid AI logic:
    it pre-filters schemes from DB before sending to Gemini.
    """

    def get_collection(self):
        """Returns the MongoDB schemes collection."""
        return get_database()["schemes"]

    async def get_all_schemes(self) -> List[dict]:
        """Fetch all schemes from MongoDB."""
        collection = self.get_collection()
        cursor = collection.find({})
        schemes = await cursor.to_list(length=None)
        return serialize_docs(schemes)

    async def get_scheme_by_id(self, scheme_id: str) -> Optional[dict]:
        """Fetch a single scheme by its MongoDB ObjectId."""
        if not is_valid_object_id(scheme_id):
            return None
        collection = self.get_collection()
        scheme = await collection.find_one({"_id": ObjectId(scheme_id)})
        return serialize_doc(scheme) if scheme else None

    async def filter_eligible_schemes(self, user_profile: dict) -> List[dict]:
        """
        Core eligibility filtering logic.
        Filters schemes from MongoDB based on:
          - Age range
          - Annual income cap
          - Category match
          - Occupation match
          - State availability

        This hybrid approach means Gemini only sees RELEVANT schemes,
        saving tokens and improving recommendation quality.
        """
        age = user_profile.get("age", 0)
        income = user_profile.get("annual_income", 0)
        category = user_profile.get("category", "general").lower()
        occupation = user_profile.get("occupation", "other").lower()
        state = user_profile.get("state", "").strip().title()
        is_bpl = user_profile.get("is_bpl", False)
        gender = user_profile.get("gender", "").lower()

        # Build category list to match against (include BPL if applicable)
        user_categories = {category, "general", "any"}
        if is_bpl:
            user_categories.add("bpl")
        if gender == "female":
            user_categories.add("women")

        # Convert to case-insensitive patterns for matching
        user_categories_lower = {c.lower() for c in user_categories}

        collection = self.get_collection()
        all_schemes = await collection.find({}).to_list(length=None)

        eligible = []
        for scheme in all_schemes:
            # ── Age Check ──────────────────────────────────────────────────────
            if not (scheme.get("min_age", 0) <= age <= scheme.get("max_age", 120)):
                continue

            # ── Income Check ───────────────────────────────────────────────────
            if income > scheme.get("max_income", float("inf")):
                continue

            # ── Category Check ─────────────────────────────────────────────────
            scheme_categories = {c.lower() for c in scheme.get("category", [])}
            if not (scheme_categories & user_categories_lower):
                continue

            # ── Occupation Check ───────────────────────────────────────────────
            scheme_occupations = {o.lower() for o in scheme.get("occupation", [])}
            if "any" not in scheme_occupations and occupation not in scheme_occupations:
                continue

            # ── State Check ────────────────────────────────────────────────────
            scheme_states = [s.lower() for s in scheme.get("states", [])]
            if "all" not in scheme_states and state.lower() not in scheme_states:
                continue

            eligible.append(scheme)

        logger.info(
            f"🔍 Filtered {len(eligible)} eligible schemes "
            f"from {len(all_schemes)} total for user: {user_profile.get('name')}"
        )
        return serialize_docs(eligible)


# Module-level singleton
scheme_service = SchemeService()
