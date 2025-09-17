from fastapi import APIRouter
from pydantic import BaseModel
from services.model_service import predict_sequence

router = APIRouter()

class InputData(BaseModel):
    Voltage_measured: float
    Current_measured: float
    Temperature_measured: float
    delta_t: float
    is_charging: int

@router.post("/predict")
def predict(data: list[InputData]):
    print("[INFO] Prediction started...")
    seq = [[
        d.Voltage_measured,
        d.Current_measured,
        d.Temperature_measured,
        d.delta_t,
        d.is_charging
    ] for d in data]

    y_pred = [predict_sequence([row])[0] for row in seq]
    print(f"[INFO] Prediction finished: {y_pred}")

    return {"prediction": y_pred}