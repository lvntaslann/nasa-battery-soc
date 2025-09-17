MODEL_TYPE = "ffn"
EPOCHS = 10
BATCH_SIZE = 128
LR = 0.001
TRAIN_MODEL = False
SEQ_LEN = 30
FEATURE_COLS = [
    'Voltage_measured',
    'Current_measured',
    'Temperature_measured',
    'delta_t',
    'is_charging'
]
TARGET_COL = 'SoC'

MODEL_PATH = f"./result/model/{MODEL_TYPE}_model.pth"
