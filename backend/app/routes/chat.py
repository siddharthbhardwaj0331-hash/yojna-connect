from fastapi import APIRouter
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

API_KEY = os.getenv("GROQ_API_KEY")


@router.post("/chat")
async def chat(data: dict):
    user_msg = data.get("message", "")

    # 🔒 safety check
    if not API_KEY:
        return {"reply": "⚠️ API key missing (check .env file)"}

    if not user_msg.strip():
        return {"reply": "⚠️ Please type something"}

    try:
        res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": "You are AI..."},
                     {"role": "user", "content": user_msg}
                ]
                
            }
        )

        data = res.json()

        # 🔍 debug
        print("GROQ RESPONSE:", data)

        # ❌ error handling
        if "error" in data:
            return {"reply": "⚠️ " + data["error"].get("message", "API Error")}

        if "choices" not in data:
            return {"reply": "⚠️ Unexpected API response"}

        reply = data["choices"][0]["message"]["content"]

        return {"reply": reply}

    except Exception as e:
        return {"reply": f"Error: {str(e)}"}