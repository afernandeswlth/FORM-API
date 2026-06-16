import json
import uuid
import os
from pathlib import Path
_DATA_BASE = Path('/tmp/wlth') if os.getenv('VERCEL') else Path(__file__).parent
from datetime import datetime, timezone
from typing import Optional, Dict, List

STORAGE_FILE = _DATA_BASE / "submissions.json"


def _load() -> Dict:
    if STORAGE_FILE.exists():
        return json.loads(STORAGE_FILE.read_text())
    return {}


def _save(data: Dict) -> None:
    STORAGE_FILE.write_text(json.dumps(data, indent=2, default=str))


def create_submission(data: dict) -> str:
    store = _load()
    submission_id = str(uuid.uuid4())
    store[submission_id] = {
        "id": submission_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "submitted",
        "form_type": data.get("form_type"),
        "loan_account_number": data.get("loan_account_number"),
        "borrower_count": len(data.get("borrowers", [])),
        "account_count": len(data.get("linked_accounts", [])),
        "data": data,
    }
    _save(store)
    return submission_id


def get_submission(submission_id: str) -> Optional[dict]:
    return _load().get(submission_id)


def list_submissions() -> List[dict]:
    store = _load()
    return [
        {k: v for k, v in s.items() if k != "data"}
        for s in store.values()
    ]


def delete_submission(submission_id: str) -> bool:
    store = _load()
    if submission_id not in store:
        return False
    del store[submission_id]
    _save(store)
    return True
