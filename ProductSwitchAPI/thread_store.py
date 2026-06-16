import json
import os
from pathlib import Path
_DATA_BASE = Path('/tmp/wlth') if os.getenv('VERCEL') else Path(__file__).parent
from typing import Optional

THREAD_FILE = _DATA_BASE / "ps_email_threads.json"


def _load() -> dict:
    if THREAD_FILE.exists():
        return json.loads(THREAD_FILE.read_text())
    return {}


def _save(data: dict) -> None:
    THREAD_FILE.write_text(json.dumps(data, indent=2))


def get_thread_message_id(loan_account_number: str) -> Optional[str]:
    """Return the Message-ID of the first email sent for this loan account, or None."""
    return _load().get(loan_account_number)


def save_thread_message_id(loan_account_number: str, message_id: str) -> None:
    """Record the Message-ID for the first email on this loan account (no-op if already exists)."""
    store = _load()
    if loan_account_number not in store:
        store[loan_account_number] = message_id
        _save(store)
