from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.db import get_db
from db.db_services import get_data_entry, get_all_data_entries

router = APIRouter()

@router.get("/data/{entry_id}")
def read_data_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = get_data_entry(db, entry_id)
    if not entry:
        return {"status": "error", "message": f"Entry with id {entry_id} not found."}
    return entry

@router.get("/data")
def read_all_data_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    entries = get_all_data_entries(db, skip=skip, limit=limit)
    return {"count": len(entries), "results": entries}
