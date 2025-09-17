import numpy as np
import torch
from sklearn.metrics import r2_score, mean_absolute_error
import os, json

def evaluate_model(model, test_loader, device, save_json="../result/scores.json", model_name="ffn",training_time=None):
    model.eval()
    predictions, actuals = [], []

    with torch.no_grad():
        for X_batch, y_batch in test_loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            y_batch = y_batch.view(-1, 1)
            preds = model(X_batch)

            predictions.append(preds.cpu().numpy())
            actuals.append(y_batch.cpu().numpy())

    predictions = np.concatenate(predictions)
    actuals = np.concatenate(actuals)

    mse = np.mean((predictions - actuals)**2)
    mae = mean_absolute_error(actuals, predictions)
    rmse = np.sqrt(mse)
    r2 = r2_score(actuals, predictions)

    print(f"\nTest Results ({model_name.upper()}):")
    print(f"MSE: {mse:.5f}, MAE: {mae:.5f}, RMSE: {rmse:.5f}, R2: {r2:.5f}")

    os.makedirs(os.path.dirname(save_json), exist_ok=True)
    scores = {}
    if os.path.exists(save_json):
        with open(save_json, 'r') as f:
            try:
                scores = json.load(f)
            except json.JSONDecodeError:
                scores = {}
    scores[model_name] = {
        "mse": round(float(mse), 5),
        "mae": round(float(mae), 5),
        "rmse": round(float(rmse), 5),
        "r2": round(float(r2), 5),
        "training_time": round(float(training_time), 5)
    }
    with open(save_json, 'w') as f:
        json.dump(scores, f, indent=4)

    return scores