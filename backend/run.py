import argparse
import os
import sys
from pathlib import Path

os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"

_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(_ROOT))

# Windows consoles often default to a legacy code page; force UTF-8 for logs and prints.
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from dotenv import load_dotenv

load_dotenv(_ROOT / ".env")

"""
Server entry point for Yojna AI (FastAPI + optional static frontend).

Usage:
    pip install -r requirements.txt
    python run.py                 # production defaults (no autoreload)
    python run.py --reload        # development (autoreload)
"""

import uvicorn

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the Yojna AI API server.")
    parser.add_argument("--host", default="0.0.0.0", help="Bind address")
    parser.add_argument("--port", type=int, default=8000, help="TCP port")
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload (development only)",
    )
    args = parser.parse_args()

    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info",
    )
