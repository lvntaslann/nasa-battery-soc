import torch
from models.ffn_model import FFNModel
from models.lstm_model import SoCPredictorLSTM
from models.bilstm_model import BiLSTMModel
from models.gru_model import GRUModel
from config import MODEL_TYPE, FEATURE_COLS, SEQ_LEN, MODEL_PATH

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None

def get_model(model_type: str, input_size: int, seq_len: int = None):
    if model_type == "ffn":
        return FFNModel(input_size=input_size, seq_len=seq_len)
    elif model_type == "lstm":
        return SoCPredictorLSTM(input_size=input_size)
    elif model_type == "bilstm":
        return BiLSTMModel(input_size=input_size)
    elif model_type == "gru":
        return GRUModel(input_size=input_size)
    else:
        raise ValueError("MODEL_TYPE must be one of: ffn, lstm, bilstm, gru")

def load_model():
    global model
    if model is None:
        input_size = len(FEATURE_COLS)
        seq_len_ffn = SEQ_LEN if MODEL_TYPE == "ffn" else None
        model = get_model(MODEL_TYPE, input_size=input_size, seq_len=seq_len_ffn).to(device)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.eval()
    return model

def predict_sequence(seq: list[list[float]]):
    mdl = load_model()
    if len(seq) < SEQ_LEN:
        last_row = seq[-1]
        for _ in range(SEQ_LEN - len(seq)):
            seq.insert(0, last_row)
    seq = seq[-SEQ_LEN:]
    X = torch.tensor([seq], dtype=torch.float32).to(device)
    with torch.no_grad():
        return mdl(X).cpu().numpy().tolist()
