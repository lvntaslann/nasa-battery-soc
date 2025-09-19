from fastapi import APIRouter
import json
import itertools
import pandas as pd
import os
from services.model_service import predict_sequence

router = APIRouter()


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEST_CSV_PATH = os.path.join(BASE_DIR, "data", "model_data", "test_df.csv")
FEATURE_COLS = ['Voltage_measured', 'Current_measured', 'Temperature_measured', 'delta_t', 'is_charging']

if os.path.exists(TEST_CSV_PATH):
    test_df = pd.read_csv(TEST_CSV_PATH)
    X_test = test_df[FEATURE_COLS].values.tolist()
    test_iterator = itertools.cycle(X_test)
    print(f"[INFO] Test CSV loaded, {len(X_test)} rows found.")
else:
    X_test = []
    test_iterator = iter([])
    print("[WARNING] Test CSV not found. Iterator empty.")


@router.get("/mqtt_predict")
async def mqtt_predict():
    response = {}

    try:
        data_to_use = dict(zip(FEATURE_COLS, next(test_iterator)))
        source = "simulated_mqtt"
        print("[DEBUG] Simulated data used:", data_to_use)
    except StopIteration:
        print("[ERROR] No data available for simulation")
        return {"status": "error", "message": "No data available."}

    seq = [[
        data_to_use.get("Voltage_measured", 0),
        data_to_use.get("Current_measured", 0),
        data_to_use.get("Temperature_measured", 0),
        data_to_use.get("delta_t", 0),
        data_to_use.get("is_charging", 0)
    ]]
    print("[DEBUG] Sequence for prediction:", seq)

    try:
        pred = predict_sequence(seq)[0]
        if isinstance(pred, (list, tuple)):
            pred = pred[0]
        print(f"[INFO] SOC predicted: {pred}")
    except Exception as e:
        print("[ERROR] Prediction failed:", e)
        pred = None

    response["data"] = data_to_use
    response["soc_predicted"] = pred
    response["source"] = source

    return response
