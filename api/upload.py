from fastapi import APIRouter, UploadFile, File, Depends
import json
from sqlalchemy.orm import Session
from services.model_service import predict_sequence
from db.db import get_db
from db.db_services import save_data_entry

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename
    print(f"[INFO] File received: {filename}")
    
    contents = await file.read()
    try:
        data_list = json.loads(contents.decode("utf-8"))
    except Exception as e:
        print("[ERROR] Failed to parse JSON file:", e)
        return {"status": "error", "message": "Failed to parse JSON file."}

    print("[INFO] Preparing data for prediction...")
    seqs = [[
        d.get("SoC", 0),
        d.get("Voltage_measured", 0),
        d.get("Current_measured", 0),
        d.get("Temperature_measured", 0),
        d.get("delta_t", 0),
        d.get("is_charging", 0)
    ] for d in data_list]

    print("[INFO] Running prediction...")
    predictions = [predict_sequence([row])[0] for row in seqs]

    cleaned_predictions = []
    for pred in predictions:
        if isinstance(pred, (list, tuple)):
            cleaned_predictions.append(pred[0])
        else:
            cleaned_predictions.append(pred)
    
    print(f"[INFO] Predictions: {cleaned_predictions}")

    for i, d in enumerate(data_list):
        data_to_save = {k: v for k, v in d.items() if k != "SoC"}
        save_data_entry(db, data_to_save, filename, cleaned_predictions[i])

    avg_SOC = sum(d.get("SoC", 0) for d in data_list) / len(data_list) if data_list else 0
    avg_voltage = sum(d.get("Voltage_measured", 0) for d in data_list) / len(data_list) if data_list else 0
    charging_ratio = (sum(d.get("is_charging", 0) for d in data_list) / len(data_list) * 100) if data_list else 0

    print(f"[INFO] Rows: {len(data_list)}, Avg SOC: {avg_SOC:.2f}, Avg Voltage: {avg_voltage:.2f}, Charging Ratio: {charging_ratio:.2f}%")

    return {
        "prediction": predictions,
        "rows": len(data_list),
        "avg_SOC": avg_SOC,
        "avg_voltage": avg_voltage,
        "charging_ratio": charging_ratio,
        "data": data_list
    }
