"""
User Service
=============
Handles all database operations for the `users` collection.
"""

from datetime import datetime, timezone
from typing import Optional

from app.database.mongodb import get_database
from app.utils.helpers import serialize_doc
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class UserService:
    """All MongoDB CRUD operations for the `users` collection."""

    def get_collection(self):
        """Returns the MongoDB users collection."""
        return get_database()["users"]

    async def save_profile(self, profile_data: dict) -> dict:
        """
        Saves a user profile to MongoDB.
        Adds a created_at timestamp automatically.
        Returns the saved document with its generated MongoDB ID.
        """
        collection = self.get_collection()

        # Add metadata
        profile_data["created_at"] = datetime.now(timezone.utc).isoformat()
        profile_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        result = await collection.insert_one(profile_data)
        logger.info(f"✅ User profile saved: {result.inserted_id}")

        # Fetch and return the saved document
        saved = await collection.find_one({"_id": result.inserted_id})
        return serialize_doc(saved)

    async def get_profile_by_id(self, user_id: str) -> Optional[dict]:
        """Retrieve a user profile by ID (not used in routes yet, but available)."""
        from bson import ObjectId
        collection = self.get_collection()
        user = await collection.find_one({"_id": ObjectId(user_id)})
        return serialize_doc(user) if user else None


# Module-level singleton
user_service = UserService()
