import os
import pandas as pd
import torch
from torch.utils.data import DataLoader
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.db import create_tables
import time
from sqlalchemy.exc import OperationalError

from utils.data_utils import SoCDataset, make_sequences
from utils.train import train_model
from utils.evaluate import evaluate_model
from api.upload import router as upload_router
from api.get_data import router as get_data_router
from api.mqtt_predict import router as mqtt_router

from services.model_service import get_model
from config import (
    MODEL_TYPE, TRAIN_MODEL, EPOCHS, BATCH_SIZE, LR, SEQ_LEN,
    FEATURE_COLS, TARGET_COL, MODEL_PATH
)


from scripts.prepare_metadata import BatteryDataPreparer
from scripts.prepare_model_data import ModelDataPreparer

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None

if TRAIN_MODEL:
    print("[INFO] Eğitim başlatılıyor...")

    metadata_path = "/app/data/metadata.csv"
    cleaned_dir   = "/app/data/cleaned_dataset"

    if not os.path.exists(metadata_path):
        print("[INFO] Metadata CSV bulunamadı, oluşturuluyor...")
        preparer = BatteryDataPreparer(
            data_dir="./BatteryAgingARC-FY08Q4",
            cleaned_dir=cleaned_dir,
            metadata_path=metadata_path
        )
        preparer.process_all()

    train_path = "/app/data/model_data/train_df.csv"
    test_path  = "/app/data/model_data/test_df.csv"

    if not os.path.exists(train_path) or not os.path.exists(test_path):
        print("[INFO] Train/test CSV’leri bulunamadı, oluşturuluyor...")
        model_preparer = ModelDataPreparer(
            data_dir="/app/data",
            cleaned_dir=cleaned_dir,
            model_data_dir="/app/data/model_data",
            meta_path=metadata_path
        )
        model_preparer.prepare()

  
    train_df = pd.read_csv(train_path)
    test_df  = pd.read_csv(test_path)

    X_train, y_train = make_sequences(
        train_df, seq_len=SEQ_LEN, feature_cols=FEATURE_COLS, target_col=TARGET_COL
    )
    X_test, y_test   = make_sequences(
        test_df, seq_len=SEQ_LEN, feature_cols=FEATURE_COLS, target_col=TARGET_COL
    )

    train_dataset = SoCDataset(X_train, y_train)
    test_dataset  = SoCDataset(X_test, y_test)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, drop_last=True)
    test_loader  = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, drop_last=False)

    input_size = X_train.shape[2]
    seq_len_ffn = X_train.shape[1] if MODEL_TYPE == "ffn" else None
    model = get_model(MODEL_TYPE, input_size=input_size, seq_len=seq_len_ffn).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    loss_fn = torch.nn.MSELoss()
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", patience=3, factor=0.5
    )

  
    model = train_model(
        model, train_loader, test_loader, optimizer, loss_fn, scheduler,
        num_epochs=EPOCHS, device=device, fig_path=f"./result/figures/{MODEL_TYPE}_loss.png"
    )

    torch.save(model.state_dict(), MODEL_PATH)
    print(f"[INFO] Model kaydedildi: {MODEL_PATH}")

    scores = evaluate_model(
        model, test_loader, device,
        save_json="./result/scores.json", model_name=MODEL_TYPE
    )
    print("[INFO] Sonuçlar kaydedildi.")

max_retries = 10
for i in range(max_retries):
    try:
        create_tables()
        break
    except OperationalError:
        print(f"[INFO] DB hazır değil, 2 saniye bekleniyor... ({i+1}/{max_retries})")
        time.sleep(2)

app = FastAPI(title="SoC Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(get_data_router)
app.include_router(mqtt_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
