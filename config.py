import os

MODEL_TYPE = os.getenv("MODEL_TYPE", "lstm")
EPOCHS = int(os.getenv("EPOCHS", 10))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", 128))
LR = float(os.getenv("LR", 0.001))
TRAIN_MODEL = os.getenv("TRAIN_MODEL", "False").lower() in ("true", "1", "yes")
SEQ_LEN = int(os.getenv("SEQ_LEN", 30))

FEATURE_COLS = [
    'SoC',
    'Voltage_measured',
    'Current_measured',
    'Temperature_measured',
    'delta_t',
    'is_charging'
]
TARGET_COL = 'SoC'

MODEL_PATH = os.getenv("MODEL_PATH", f"./result/model/{MODEL_TYPE}_model.pth")
