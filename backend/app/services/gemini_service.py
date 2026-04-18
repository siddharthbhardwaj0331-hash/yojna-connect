"""
Gemini AI Service
==================
Handles all interactions with Google's Gemini API.
Builds smart prompts and parses AI responses for scheme recommendations.
"""

from __future__ import annotations

import asyncio
import json
import re
from typing import Any, List, Optional, Tuple

import google.generativeai as genai

from app.utils.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


def _extract_response_text(response: Any) -> str:
    """Safely read Gemini text (handles blocked / empty / multi-part responses)."""
    if response is None:
        return ""
    try:
        t = getattr(response, "text", None)
        if t:
            return str(t).strip()
    except (ValueError, AttributeError):
        pass
    except Exception:
        logger.debug("Could not read response.text", exc_info=True)

    chunks: list[str] = []
    for cand in getattr(response, "candidates", None) or []:
        content = getattr(cand, "content", None)
        if content is None:
            continue
        for part in getattr(content, "parts", None) or []:
            text = getattr(part, "text", None)
            if text:
                chunks.append(str(text))
    return "\n".join(chunks).strip()


def _parse_json_from_gemini(raw_text: str) -> dict:
    """Parse JSON from Gemini output; tolerate markdown fences and leading/trailing prose."""
    text = (raw_text or "").strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        snippet = text[start : end + 1]
        parsed = json.loads(snippet)
        if isinstance(parsed, dict):
            return parsed

    raise json.JSONDecodeError("Could not parse JSON object from model output", text, 0)


def _model_candidates() -> List[str]:
    raw = (settings.GEMINI_MODEL or "").strip()
    fallbacks = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
    ]
    ordered = [raw] + fallbacks if raw else fallbacks
    seen: set[str] = set()
    out: List[str] = []
    for name in ordered:
        if not name or name in seen:
            continue
        seen.add(name)
        out.append(name)
    return out


class GeminiService:
    """
    Encapsulates all Gemini API logic.
    Initialized once and reused across requests (singleton pattern via dependency injection).
    """

    def __init__(self) -> None:
        self._generation_config = {
            "temperature": 0.4,
            "top_p": 0.9,
            "max_output_tokens": 2048,
        }
        self._enabled = bool(settings.GEMINI_API_KEY)
        if not self._enabled:
            logger.warning("GEMINI_API_KEY not set. AI recommendations will use DB-only fallback.")
            return
        genai.configure(api_key=settings.GEMINI_API_KEY)
        logger.info("Gemini API configured (models tried per request: %s)", ", ".join(_model_candidates()))

    def _build_prompt(self, user_profile: dict, schemes: list) -> str:
        income_raw = user_profile.get("annual_income", 0) or 0
        try:
            income_f = float(income_raw)
        except (TypeError, ValueError):
            income_f = 0.0

        schemes_text = ""
        for i, s in enumerate(schemes, 1):
            ben = self._as_text(s.get("benefits", ""))
            eli = self._as_text(s.get("eligibility", ""))
            schemes_text += f"""
{i}. {s['name']}
   - Benefits: {ben}
   - Eligibility: {eli}
   - Apply: {s.get('apply_link', '')}
   - Ministry: {s.get('ministry', 'N/A')}
"""

        prompt = f"""
You are "Yojna AI", an expert assistant helping Indian citizens find the best government schemes.

USER PROFILE:
- Name: {user_profile.get('name')}
- Age: {user_profile.get('age')} years
- Annual Income: ₹{income_f:,.0f}
- Occupation: {user_profile.get('occupation')}
- State: {user_profile.get('state')}
- Category: {user_profile.get('category')}
- Gender: {user_profile.get('gender', 'Not specified')}
- BPL Card Holder: {'Yes' if user_profile.get('is_bpl') else 'No'}
- Owns Agricultural Land: {'Yes' if user_profile.get('has_land') else 'No'}

ELIGIBLE SCHEMES FROM DATABASE:
{schemes_text if schemes_text.strip() else "No schemes matched the basic filters."}

YOUR TASK:
1. Analyze the user's profile carefully.
2. Rank the above schemes by relevance for THIS specific user.
3. For each scheme, write a personalized "reason" explaining WHY it suits this user.
4. Write the reason in simple Hindi mixed with English (Hinglish) so it's easy to understand.
5. Return a JSON object ONLY — no extra text, no markdown, no explanation outside JSON.

REQUIRED JSON FORMAT (return exactly this structure):
{{
  "ai_summary": "2-3 line overall summary in Hinglish about the user's situation and opportunities",
  "recommended_schemes": [
    {{
      "name": "Exact scheme name",
      "reason": "Personalized reason in Hinglish — why this suits {user_profile.get('name')}",
      "benefits": "Key benefits in bullet points — simple language",
      "eligibility": "Eligibility criteria briefly",
      "apply_link": "https://..."
    }}
  ]
}}

IMPORTANT RULES:
- Use warm, helpful, encouraging tone
- Write in simple language that an average Indian villager/town person can understand
- Prioritize the most impactful schemes first
- If a scheme doesn't fit well, exclude it rather than include a weak recommendation
- Never make up schemes — only use the ones provided above
- Return ONLY valid JSON, nothing else
"""
        return prompt

    async def _generate_content(self, prompt: str) -> Tuple[Optional[Any], Optional[str]]:
        """Call Gemini in a thread pool so the FastAPI event loop stays responsive on Windows."""
        last_error: Optional[BaseException] = None
        for model_name in _model_candidates():
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=self._generation_config,
            )
            try:
                response = await asyncio.to_thread(model.generate_content, prompt)
                return response, model_name
            except Exception as exc:
                last_error = exc
                logger.warning("Gemini model %r failed: %s", model_name, exc)
        if last_error:
            logger.error("All Gemini model candidates failed: %s", last_error)
        return None, None

    async def get_recommendations(
        self, user_profile: dict, filtered_schemes: list
    ) -> tuple[list, str]:
        if not self._enabled:
            logger.warning("Gemini not available. Returning basic recommendations.")
            return self._fallback_recommendations(filtered_schemes), "AI सेवा अभी उपलब्ध नहीं है।"

        if not filtered_schemes:
            return [], "आपकी प्रोफ़ाइल के अनुसार अभी कोई योजना उपलब्ध नहीं मिली।"

        prompt = self._build_prompt(user_profile, filtered_schemes)
        raw_text = ""

        try:
            logger.info("Sending %s schemes to Gemini for ranking...", len(filtered_schemes))
            response, used_model = await self._generate_content(prompt)
            if response is None:
                return self._fallback_recommendations(filtered_schemes), "AI सेवा में त्रुटि हुई।"

            raw_text = _extract_response_text(response)
            logger.debug("Gemini raw response (%s), length=%s", used_model, len(raw_text))

            parsed = _parse_json_from_gemini(raw_text)
            recommended = parsed.get("recommended_schemes", [])
            summary = parsed.get("ai_summary", "")

            if not isinstance(recommended, list):
                recommended = []

            logger.info("Gemini returned %s recommendations (model=%s).", len(recommended), used_model)
            return recommended, str(summary or "")

        except json.JSONDecodeError as exc:
            logger.error("Failed to parse Gemini JSON response: %s", exc)
            logger.debug("Raw Gemini response (truncated): %s", (raw_text or "")[:800])
            return self._fallback_recommendations(filtered_schemes), "AI response parse error."

        except Exception as exc:
            logger.error("Gemini API error: %s", exc, exc_info=True)
            return self._fallback_recommendations(filtered_schemes), "AI सेवा में त्रुटि हुई।"

    @staticmethod
    def _as_text(val: Any) -> str:
        if val is None:
            return ""
        if isinstance(val, list):
            return "; ".join(str(x) for x in val)
        return str(val)

    def _fallback_recommendations(self, schemes: list) -> list:
        return [
            {
                "name": s["name"],
                "reason": "यह योजना आपकी पात्रता मानदंडों के आधार पर चुनी गई है।",
                "benefits": self._as_text(s.get("benefits", "")),
                "eligibility": self._as_text(s.get("eligibility", "")),
                "apply_link": s.get("apply_link", "") or "#",
            }
            for s in schemes
        ]


gemini_service = GeminiService()
