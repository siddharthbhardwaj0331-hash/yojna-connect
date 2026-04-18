"""
MongoDB Connection & Seeding
==============================
Manages the async MongoDB client lifecycle using Motor (async MongoDB driver).
Falls back to an in-memory implementation if MongoDB is unreachable (or if configured).
Seeds sample government schemes on first run.
"""

from __future__ import annotations

import copy
from typing import Any, Optional

import motor.motor_asyncio
from bson import ObjectId
from pymongo import ASCENDING

from app.utils.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
db = None


class _MemoryCursor:
    def __init__(self, docs: list[dict]):
        self._docs = docs

    async def to_list(self, length: Optional[int] = None) -> list[dict]:
        if length is None:
            return copy.deepcopy(self._docs)
        return copy.deepcopy(self._docs[:length])


class _MemoryCollection:
    """Minimal async collection API used by this app (find/to_list, find_one, insert_one, update_one, create_index)."""

    def __init__(self, name: str):
        self.name = name
        self._docs: list[dict] = []

    async def create_index(self, *args: Any, **kwargs: Any) -> None:
        return None

    @staticmethod
    def _eq(a: Any, b: Any) -> bool:
        return a == b

    def _matches(self, query: dict, doc: dict) -> bool:
        if not query:
            return True
        for key, val in query.items():
            if key == "$or":
                return any(self._matches(sub, doc) for sub in val)
            if not self._eq(doc.get(key), val):
                return False
        return True

    def find(self, query: Optional[dict] = None):
        query = query or {}
        if query == {}:
            return _MemoryCursor([copy.deepcopy(d) for d in self._docs])
        matched = [d for d in self._docs if self._matches(query, d)]
        return _MemoryCursor([copy.deepcopy(d) for d in matched])

    async def find_one(self, query: dict):
        for d in self._docs:
            if self._matches(query, d):
                return copy.deepcopy(d)
        return None

    async def insert_one(self, doc: dict):
        doc = dict(doc)
        doc.setdefault("_id", ObjectId())
        self._docs.append(doc)

        class _R:
            inserted_id = doc["_id"]

        return _R()

    async def update_one(self, filter: dict, update: dict, upsert: bool = False):
        class _R:
            upserted_id = None

        result = _R()
        for d in self._docs:
            if self._matches(filter, d):
                return result
        if upsert and "$setOnInsert" in update:
            new_doc = dict(update["$setOnInsert"])
            new_doc.setdefault("_id", ObjectId())
            self._docs.append(new_doc)
            result.upserted_id = new_doc["_id"]
        return result


class _MemoryDatabase:
    def __init__(self) -> None:
        self._collections: dict[str, _MemoryCollection] = {}

    def __getitem__(self, name: str) -> _MemoryCollection:
        if name not in self._collections:
            self._collections[name] = _MemoryCollection(name)
        return self._collections[name]


def _use_memory_explicitly() -> bool:
    if settings.USE_MEMORY_DB:
        return True
    url = settings.MONGODB_URL.strip().lower()
    return url in ("memory", "memory://", "inmemory")


async def _connect_memory() -> None:
    global client, db
    client = None
    db = _MemoryDatabase()
    logger.info("Using in-memory database (no external MongoDB process).")


async def connect_to_mongo():
    """Initialize MongoDB (Motor) or the in-memory fallback."""
    global client, db

    if _use_memory_explicitly():
        await _connect_memory()
        return

    try:
        motor_client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
        )
        database = motor_client[settings.DATABASE_NAME]
        await motor_client.admin.command("ping")
        client = motor_client
        db = database
        logger.info("Connected to MongoDB database: %s", settings.DATABASE_NAME)
    except Exception as exc:
        logger.warning(
            "MongoDB unavailable (%s). Falling back to in-memory database.",
            exc,
        )
        await _connect_memory()


async def close_mongo_connection():
    """Close the MongoDB connection (no-op for in-memory)."""
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")
    client = None


def get_database():
    """Dependency injector — returns the active database instance."""
    return db


# ─── Sample Schemes Data ───────────────────────────────────────────────────────
SAMPLE_SCHEMES = [
    {
        "name": "PM Awas Yojana (Urban)",
        "description": "Housing for All by 2022 — provides affordable housing to urban poor.",
        "category": ["BPL", "EWS", "LIG", "MIG"],         # Target categories
        "min_age": 18,
        "max_age": 70,
        "max_income": 1800000,                              # Annual income in INR
        "occupation": ["any"],
        "states": ["all"],                                  # Available in all states
        "benefits": "Subsidy up to ₹2.67 lakh on home loans; affordable housing units.",
        "eligibility": "Urban residents who do not own a pucca house; income within EWS/LIG/MIG limits.",
        "apply_link": "https://pmaymis.gov.in/",
        "ministry": "Ministry of Housing and Urban Affairs",
        "tags": ["housing", "urban", "subsidy", "loan"],
    },
    {
        "name": "PM Awas Yojana (Gramin)",
        "description": "Provides financial assistance to rural households to construct pucca houses.",
        "category": ["BPL", "SC", "ST", "OBC", "EWS"],
        "min_age": 18,
        "max_age": 70,
        "max_income": 600000,
        "occupation": ["farmer", "labour", "any"],
        "states": ["all"],
        "benefits": "₹1.2 lakh in plains, ₹1.3 lakh in hilly/NE states for house construction.",
        "eligibility": "Rural households without a pucca house; listed in SECC 2011 data.",
        "apply_link": "https://pmayg.nic.in/",
        "ministry": "Ministry of Rural Development",
        "tags": ["housing", "rural", "construction", "grant"],
    },
    {
        "name": "Skill India Mission (PMKVY)",
        "description": "Pradhan Mantri Kaushal Vikas Yojana — free skill training with certification.",
        "category": ["general", "SC", "ST", "OBC", "EWS"],
        "min_age": 15,
        "max_age": 45,
        "max_income": 500000,
        "occupation": ["unemployed", "student", "labour"],
        "states": ["all"],
        "benefits": "Free skill training, ₹8000 reward on certification, placement assistance.",
        "eligibility": "Indian citizen aged 15–45; school/college dropouts and unemployed youth.",
        "apply_link": "https://www.pmkvyofficial.org/",
        "ministry": "Ministry of Skill Development and Entrepreneurship",
        "tags": ["skill", "training", "youth", "employment", "certificate"],
    },
    {
        "name": "PM Jan Dhan Yojana",
        "description": "Financial inclusion scheme — zero-balance bank accounts for all Indians.",
        "category": ["general", "BPL", "SC", "ST", "OBC"],
        "min_age": 10,
        "max_age": 100,
        "max_income": 9999999,
        "occupation": ["any"],
        "states": ["all"],
        "benefits": "Zero-balance account, RuPay debit card, ₹2 lakh accident insurance, ₹10,000 overdraft.",
        "eligibility": "Any Indian citizen without a bank account; no minimum balance required.",
        "apply_link": "https://www.pmjdy.gov.in/",
        "ministry": "Ministry of Finance",
        "tags": ["banking", "financial inclusion", "insurance", "savings"],
    },
    {
        "name": "Ayushman Bharat - PM Jan Arogya Yojana",
        "description": "World's largest health insurance scheme — ₹5 lakh cover per family per year.",
        "category": ["BPL", "EWS", "SC", "ST", "OBC"],
        "min_age": 0,
        "max_age": 100,
        "max_income": 300000,
        "occupation": ["any"],
        "states": ["all"],
        "benefits": "₹5 lakh health cover per family/year; cashless treatment at empanelled hospitals.",
        "eligibility": "Families identified as deprived in SECC database; no cap on family size or age.",
        "apply_link": "https://pmjay.gov.in/",
        "ministry": "Ministry of Health and Family Welfare",
        "tags": ["health", "insurance", "medical", "hospital", "BPL"],
    },
    {
        "name": "PM Mudra Yojana",
        "description": "Micro-finance loans for non-corporate small businesses and entrepreneurs.",
        "category": ["general", "SC", "ST", "OBC", "women"],
        "min_age": 18,
        "max_age": 65,
        "max_income": 2500000,
        "occupation": ["self-employed", "businessman", "entrepreneur", "farmer"],
        "states": ["all"],
        "benefits": "Collateral-free loans: Shishu (up to ₹50K), Kishore (₹50K–5L), Tarun (₹5L–10L).",
        "eligibility": "Non-farm micro/small enterprises; no collateral needed for Shishu loans.",
        "apply_link": "https://www.mudra.org.in/",
        "ministry": "Ministry of Finance",
        "tags": ["loan", "business", "entrepreneur", "self-employment", "MSME"],
    },
    {
        "name": "Sukanya Samriddhi Yojana",
        "description": "Small savings scheme for the girl child — high interest + tax benefits.",
        "category": ["general", "SC", "ST", "OBC", "BPL"],
        "min_age": 0,
        "max_age": 10,                                      # Account opened for girl aged 0–10
        "max_income": 9999999,
        "occupation": ["any"],
        "states": ["all"],
        "benefits": "8.2% interest rate (2024), tax exemption under 80C, maturity at 21 years.",
        "eligibility": "Girl child below 10 years; account opened by parent/guardian; one account per girl.",
        "apply_link": "https://www.india.gov.in/sukanya-samriddhi-account",
        "ministry": "Ministry of Finance",
        "tags": ["girl child", "savings", "education", "tax", "investment"],
    },
    {
        "name": "PM Kisan Samman Nidhi",
        "description": "Direct income support of ₹6000/year to farmer families.",
        "category": ["farmer", "general", "SC", "ST", "OBC"],
        "min_age": 18,
        "max_age": 100,
        "max_income": 200000,
        "occupation": ["farmer"],
        "states": ["all"],
        "benefits": "₹6000/year in 3 instalments of ₹2000 directly into bank account.",
        "eligibility": "Small and marginal farmers owning up to 2 hectares of cultivable land.",
        "apply_link": "https://pmkisan.gov.in/",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "tags": ["farmer", "agriculture", "income support", "direct benefit"],
    },
    {
        "name": "Stand Up India",
        "description": "Bank loans for SC/ST and women entrepreneurs to set up greenfield enterprises.",
        "category": ["SC", "ST", "women"],
        "min_age": 18,
        "max_age": 65,
        "max_income": 9999999,
        "occupation": ["entrepreneur", "self-employed", "businessman"],
        "states": ["all"],
        "benefits": "Loans between ₹10 lakh and ₹1 crore for greenfield enterprises; composite loan.",
        "eligibility": "SC/ST individuals or women entrepreneurs above 18; first-time enterprise.",
        "apply_link": "https://www.standupmitra.in/",
        "ministry": "Ministry of Finance",
        "tags": ["loan", "SC", "ST", "women", "startup", "enterprise"],
    },
    {
        "name": "National Scholarship Portal (NSP)",
        "description": "Centralised scholarship platform for students from minority, SC/ST, OBC communities.",
        "category": ["SC", "ST", "OBC", "minority", "EWS"],
        "min_age": 10,
        "max_age": 35,
        "max_income": 250000,
        "occupation": ["student"],
        "states": ["all"],
        "benefits": "Pre-matric and post-matric scholarships; merit-cum-means scholarships for higher education.",
        "eligibility": "Students from SC/ST/OBC/minority communities with income below threshold.",
        "apply_link": "https://scholarships.gov.in/",
        "ministry": "Ministry of Education",
        "tags": ["scholarship", "student", "education", "SC", "ST", "OBC", "minority"],
    },
    {
        "name": "Atal Pension Yojana",
        "description": "Guaranteed pension scheme for unorganised sector workers.",
        "category": ["general", "BPL", "SC", "ST", "OBC"],
        "min_age": 18,
        "max_age": 40,
        "max_income": 9999999,
        "occupation": ["labour", "self-employed", "farmer", "any"],
        "states": ["all"],
        "benefits": "Guaranteed monthly pension of ₹1000–₹5000 after age 60; government co-contributes.",
        "eligibility": "Indian citizen aged 18–40 with savings bank account; not an income tax payer.",
        "apply_link": "https://www.npscra.nsdl.co.in/scheme-details.php",
        "ministry": "Ministry of Finance",
        "tags": ["pension", "retirement", "unorganised sector", "social security"],
    },
    {
        "name": "PM SVANidhi (Street Vendor Loan)",
        "description": "Micro-credit for street vendors to restart livelihoods post-COVID.",
        "category": ["general", "SC", "ST", "OBC", "BPL"],
        "min_age": 18,
        "max_age": 65,
        "max_income": 300000,
        "occupation": ["vendor", "self-employed", "labour"],
        "states": ["all"],
        "benefits": "Collateral-free loans: ₹10K → ₹20K → ₹50K; 7% interest subsidy; digital rewards.",
        "eligibility": "Street vendors with vending certificate or letter of recommendation from ULB.",
        "apply_link": "https://pmsvanidhi.mohua.gov.in/",
        "ministry": "Ministry of Housing and Urban Affairs",
        "tags": ["vendor", "micro-loan", "urban", "self-employment", "COVID relief"],
    },
]


async def seed_schemes():
    """
    Seeds the database with sample government schemes.
    Uses upsert to avoid duplicates — safe to run on every startup.
    """
    collection = db["schemes"]

    # Create index on scheme name for fast lookups and uniqueness
    await collection.create_index([("name", ASCENDING)], unique=True)

    seeded_count = 0
    for scheme in SAMPLE_SCHEMES:
        result = await collection.update_one(
            {"name": scheme["name"]},      # Match by name
            {"$setOnInsert": scheme},       # Only insert if not already present
            upsert=True,
        )
        if result.upserted_id:
            seeded_count += 1

    if seeded_count > 0:
        logger.info(f"🌱 Seeded {seeded_count} new schemes into the database.")
    else:
        logger.info("✅ All schemes already present. No seeding needed.")
