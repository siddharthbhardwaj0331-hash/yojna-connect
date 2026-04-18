"""
Helper Utilities
=================
Miscellaneous helper functions used across the app.
"""

from bson import ObjectId


def serialize_doc(doc: dict) -> dict:
    """
    Converts a MongoDB document to a JSON-serializable dict.
    - Converts ObjectId `_id` to string `id`
    - Removes raw `_id` from output
    """
    if doc is None:
        return {}
    out = dict(doc)
    out["id"] = str(out.get("_id", ""))
    out.pop("_id", None)
    return out


def serialize_docs(docs: list) -> list:
    """Applies serialize_doc to a list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]


def is_valid_object_id(oid: str) -> bool:
    """Checks if a string is a valid MongoDB ObjectId."""
    try:
        ObjectId(oid)
        return True
    except Exception:
        return False
