# 🇮🇳 Yojna AI — Indian Government Scheme Recommendation Backend

> An AI-powered FastAPI backend that recommends relevant Indian government schemes
> to citizens based on their profile using **Google Gemini AI** + **MongoDB**.

---

## 📁 Project Structure

```
yojna-ai/
├── app/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── database/
│   │   ├── __init__.py
│   │   └── mongodb.py           # MongoDB connection + scheme seeding
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # Pydantic models for user profile
│   │   └── scheme.py            # Pydantic models for schemes & recommendations
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── users.py             # POST /api/user/profile
│   │   └── schemes.py           # GET /api/schemes, GET /api/schemes/{id}, POST /api/schemes/recommend
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gemini_service.py    # Gemini AI integration & prompt engineering
│   │   ├── scheme_service.py    # MongoDB scheme queries & eligibility filtering
│   │   └── user_service.py      # MongoDB user profile CRUD
│   └── utils/
│       ├── __init__.py
│       ├── config.py            # Environment variables via Pydantic BaseSettings
│       ├── helpers.py           # MongoDB ObjectId serialization helpers
│       └── logger.py            # Consistent logging setup
├── .env.example                 # Template for environment variables
├── .gitignore
├── requirements.txt
├── run.py                       # Server entry point
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone / Download the project

```bash
cd yojna-ai
```

### 2. Create a virtual environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
nano .env    # or use any text editor
```

Your `.env` should look like:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=yojna_ai
GEMINI_API_KEY=your_actual_gemini_api_key_here
CORS_ORIGINS=*
# If MongoDB is stopped, the server falls back to an in-memory DB (dev only).
# USE_MEMORY_DB=false
```

> 🔑 **Get Gemini API Key free:** https://aistudio.google.com/app/apikey

### 5. Start MongoDB

```bash
# If MongoDB is installed locally:
mongod --dbpath /data/db

# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 6. (Optional) Build the Next.js UI

```bash
cd frontend
npm install
npm run build
```

When `frontend/out` exists, `python run.py` serves the UI at **http://localhost:8000/** alongside the API under **http://localhost:8000/api/**.

### 7. Run the server

```bash
# Option A: Using run.py (recommended — production defaults, no autoreload)
python run.py

# Development with autoreload:
python run.py --reload

# Option B: Using uvicorn directly
uvicorn app.main:app --reload --port 8000
```

The server listens at: **http://localhost:8000**

---

## 📖 API Documentation

Once the server is running, visit:

| Interface | URL |
|-----------|-----|
| 📘 Swagger UI (interactive) | http://localhost:8000/docs |
| 📗 ReDoc (clean docs) | http://localhost:8000/redoc |
| ❤️ Health Check | http://localhost:8000/health |

---

## 🔌 API Endpoints

### `POST /api/user/profile` — Save User Profile

Save a citizen's demographic and income details.

**Request Body:**
```json
{
  "name": "Ramesh Kumar",
  "age": 35,
  "annual_income": 180000,
  "occupation": "farmer",
  "state": "Uttar Pradesh",
  "category": "OBC",
  "gender": "male",
  "is_bpl": true,
  "has_land": true
}
```

**Response:**
```json
{
  "id": "674a1b2c3d4e5f6789012345",
  "name": "Ramesh Kumar",
  "age": 35,
  "annual_income": 180000.0,
  "occupation": "farmer",
  "state": "Uttar Pradesh",
  "category": "OBC",
  "message": "✅ Ramesh Kumar का प्रोफ़ाइल सफलतापूर्वक सहेजा गया!"
}
```

---

### `POST /api/schemes/recommend` — AI Recommendations ⭐

The flagship endpoint. Returns AI-ranked scheme recommendations with Hinglish explanations.

**Request Body:**
```json
{
  "name": "Priya Sharma",
  "age": 22,
  "annual_income": 120000,
  "occupation": "student",
  "state": "Rajasthan",
  "category": "SC",
  "gender": "female",
  "is_bpl": false,
  "has_land": false
}
```

**Response:**
```json
{
  "user_name": "Priya Sharma",
  "total_schemes_found": 4,
  "ai_summary": "Priya ji, aapki profile ke hisaab se kaafi achhi government schemes available hain...",
  "recommended_schemes": [
    {
      "name": "National Scholarship Portal (NSP)",
      "reason": "Priya ji, aap SC category mein hain aur student hain — NSP scholarship aapke liye bilkul sahi hai!",
      "benefits": "• Pre-matric aur post-matric scholarships\n• Merit-cum-means support for higher education",
      "eligibility": "SC/ST/OBC/minority students with income below ₹2.5 lakh",
      "apply_link": "https://scholarships.gov.in/"
    }
  ],
  "disclaimer": "यह जानकारी सहायता के लिए है। कृपया आधिकारिक वेबसाइट पर जाकर पात्रता की पुष्टि करें।"
}
```

---

### `GET /api/schemes` — List All Schemes

```bash
curl http://localhost:8000/api/schemes
```

Returns all 12 pre-seeded government schemes.

---

### `GET /api/schemes/{id}` — Get Scheme Details

```bash
curl http://localhost:8000/api/schemes/674a1b2c3d4e5f6789012345
```

---

## 🤖 How the AI Logic Works

```
User Profile (age, income, category, occupation, state)
        │
        ▼
┌─────────────────────────────────────┐
│   STEP 1: MongoDB Eligibility Filter │
│   • Age range check                  │
│   • Income cap check                 │
│   • Category match (SC/OBC/etc.)     │
│   • Occupation match                 │
│   • State availability               │
└─────────────────────────────────────┘
        │
        ▼ (Only eligible schemes passed to AI)
┌─────────────────────────────────────┐
│   STEP 2: Gemini AI Ranking          │
│   • Ranks schemes by relevance       │
│   • Writes personalized reason       │
│   • Responds in Hinglish             │
│   • Returns structured JSON          │
└─────────────────────────────────────┘
        │
        ▼
   Clean JSON Response to Client
```

**Why Hybrid?**
- Filtering in MongoDB first reduces API tokens sent to Gemini (cheaper & faster)
- Gemini focuses only on RELEVANT schemes → better quality explanations
- Works even if Gemini is down (falls back to basic DB recommendations)

---

## 🌱 Pre-loaded Government Schemes

| Scheme | Ministry |
|--------|----------|
| PM Awas Yojana (Urban) | Housing & Urban Affairs |
| PM Awas Yojana (Gramin) | Rural Development |
| PM Kaushal Vikas Yojana (PMKVY) | Skill Development |
| PM Jan Dhan Yojana | Finance |
| Ayushman Bharat - PMJAY | Health |
| PM Mudra Yojana | Finance |
| Sukanya Samriddhi Yojana | Finance |
| PM Kisan Samman Nidhi | Agriculture |
| Stand Up India | Finance |
| National Scholarship Portal | Education |
| Atal Pension Yojana | Finance |
| PM SVANidhi | Housing & Urban Affairs |

---

## 🧪 Test with cURL

```bash
# Health check
curl http://localhost:8000/health

# Save a profile
curl -X POST http://localhost:8000/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Suresh Yadav",
    "age": 42,
    "annual_income": 150000,
    "occupation": "farmer",
    "state": "Bihar",
    "category": "OBC",
    "is_bpl": true,
    "has_land": true
  }'

# Get AI recommendations
curl -X POST http://localhost:8000/api/schemes/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Suresh Yadav",
    "age": 42,
    "annual_income": 150000,
    "occupation": "farmer",
    "state": "Bihar",
    "category": "OBC",
    "is_bpl": true,
    "has_land": true
  }'

# List all schemes
curl http://localhost:8000/api/schemes
```

---

## 🔧 Occupation Values (valid options)

`student` | `farmer` | `labour` | `self-employed` | `businessman` | `salaried` | `unemployed` | `vendor` | `entrepreneur` | `other`

## 🏷️ Category Values (valid options)

`general` | `SC` | `ST` | `OBC` | `EWS` | `minority` | `women` | `BPL`

---

## 🚀 Production Deployment Tips

1. **Set `DEBUG=False`** in `.env`
2. **Use MongoDB Atlas** instead of local MongoDB for reliability
3. **Use Gunicorn** as process manager:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
   ```
4. **Restrict CORS** in `main.py` — replace `"*"` with your frontend domain
5. **Add rate limiting** using `slowapi` library
6. **Use environment secrets manager** (AWS Secrets Manager, GCP Secret Manager) instead of `.env`

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

*Built with ❤️ for Bharat | Powered by FastAPI + Gemini AI + MongoDB*
