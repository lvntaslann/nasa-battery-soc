from fastapi import APIRouter, UploadFile, File
import json
from services.model_service import predict_sequence
from config import FEATURE_COLS, TARGET_COL

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print("[INFO] File received for upload...")
    contents = await file.read()
    
    try:
        data_list = json.loads(contents.decode("utf-8"))
    except Exception as e:
        print("[ERROR] Failed to parse JSON file:", e)
        return {"status": "error", "message": "Failed to parse JSON file."}

    print("[INFO] Preparing data for prediction...")
    seq = [[
        d.get("Voltage_measured", 0),
        d.get("Current_measured", 0),
        d.get("Temperature_measured", 0),
        d.get("delta_t", 0),
        d.get("is_charging", 0)
    ] for d in data_list]

    print("[INFO] Running prediction...")
    # Her satır için ayrı tahmin
    y_pred = [predict_sequence([row])[0] for row in seq]
    print(f"[INFO] Prediction completed: {y_pred}")

    avg_SOC = sum(d.get("SoC", 0) for d in data_list) / len(data_list) if data_list else 0
    avg_voltage = sum(d.get("Voltage_measured", 0) for d in data_list) / len(data_list) if data_list else 0
    charging_ratio = (sum(d.get("is_charging", 0) for d in data_list) / len(data_list) * 100) if data_list else 0

    print(f"[INFO] Rows: {len(data_list)}, Avg SOC: {avg_SOC:.2f}, Avg Voltage: {avg_voltage:.2f}, Charging Ratio: {charging_ratio:.2f}%")

    return {
        "prediction": y_pred,        # artık her satır için tahmin var
        "rows": len(data_list),
        "avg_SOC": avg_SOC,
        "avg_voltage": avg_voltage,
        "charging_ratio": charging_ratio,
        "data": data_list
    }
