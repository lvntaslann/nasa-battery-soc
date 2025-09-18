from .models import DataEntry
from sqlalchemy.orm import Session

def save_data_entry(db: Session, data: dict, filename: str, soc_predicted: float):
    entry = DataEntry(
        filename=filename,
        voltage_measured=data.get("Voltage_measured", 0),
        current_measured=data.get("Current_measured", 0),
        temperature_measured=data.get("Temperature_measured", 0),
        delta_t=data.get("delta_t", 0),
        is_charging=bool(data.get("is_charging", 0)),
        soc_predicted=soc_predicted
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_data_entry(db: Session, entry_id: int):
    return db.query(DataEntry).filter(DataEntry.id == entry_id).first()

def get_all_data_entries(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DataEntry).offset(skip).limit(limit).all()
