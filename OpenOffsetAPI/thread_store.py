import json
from pathlib import Path
from typing import Optional

THREAD_FILE = Path("oo_email_threads.json")


def _load() -> dict:
    if THREAD_FILE.exists():
        return json.loads(THREAD_FILE.read_text())
    return {}


def _save(data: dict) -> None:
    THREAD_FILE.write_text(json.dumps(data, indent=2))


def get_thread_message_id(linked_account_number: str) -> Optional[str]:
    """Return the Message-ID of the first email sent for this account, or None."""
    return _load().get(linked_account_number)


def save_thread_message_id(linked_account_number: str, message_id: str) -> None:
    """Record the Message-ID for the first email on this account (no-op if already exists)."""
    store = _load()
    if linked_account_number not in store:
        store[linked_account_number] = message_id
        _save(store)
