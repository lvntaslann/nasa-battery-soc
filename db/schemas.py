from pydantic import BaseModel

class DataEntryCreate(BaseModel):
    filename: str
    voltage_measured: float
    current_measured: float
    temperature_measured: float
    delta_t: float
    is_charging: bool
    soc_predicted: float

class DataEntryResponse(DataEntryCreate):
    id: int
    created_at: str
