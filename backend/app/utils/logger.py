"""
Logging Utility
================
Provides a consistent, colored logger for all modules.
Call `setup_logger(__name__)` at the top of any file.
"""

import logging
import sys


def _safe_stream():
    """Prefer UTF-8 on Windows so log messages with non-ASCII text do not crash."""
    stream = sys.stdout
    if hasattr(stream, "buffer"):
        try:
            return open(stream.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)
        except Exception:
            pass
    return stream


def setup_logger(name: str) -> logging.Logger:
    """
    Creates and returns a logger with:
    - Console output (stdout)
    - Timestamp, level, and module name in the format
    - Configurable log level via settings
    """
    logger = logging.getLogger(name)

    # Avoid adding duplicate handlers if logger already configured
    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG)
    logger.propagate = False

    # ── Console Handler ────────────────────────────────────────────────────────
    handler = logging.StreamHandler(_safe_stream())
    handler.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger
