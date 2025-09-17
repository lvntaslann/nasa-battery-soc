from sqlalchemy import Column, Integer, Float, Boolean, String, DateTime, func
from db.db import Base

class DataEntry(Base):
    __tablename__ = "data_entries"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=True)
    voltage_measured = Column(Float)
    current_measured = Column(Float)
    temperature_measured = Column(Float)
    delta_t = Column(Float)
    is_charging = Column(Boolean)
    soc_predicted = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())