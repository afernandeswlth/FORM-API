import json
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Dict, List

STORE_DIR = Path(__file__).parent / "ddr_submissions"


def _store_file() -> Path:
    STORE_DIR.mkdir(parents=True, exist_ok=True)
    return STORE_DIR / "submissions.json"


def _load() -> Dict:
    f = _store_file()
    if f.exists():
        return json.loads(f.read_text())
    return {}


def _save(data: Dict) -> None:
    _store_file().write_text(json.dumps(data, indent=2, default=str))


def create_submission(data: dict) -> str:
    store = _load()
    submission_id = str(uuid.uuid4())
    store[submission_id] = {
        "id": submission_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "submitted",
        "loan_account_number": data.get("loan_account_number"),
        "borrower_count": len(data.get("borrowers", [])),
        "account_count": len(data.get("debit_accounts", [])),
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
