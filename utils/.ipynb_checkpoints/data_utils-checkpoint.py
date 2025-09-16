import numpy as np
import torch
from torch.utils.data import Dataset
import sys
import os

sys.path.append(os.path.abspath('../'))

class SoCDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


def make_sequences(df, seq_len, feature_cols, target_col='SoC'):
    X, y = [], []
    for (_, _), group in df.groupby(['battery_id', 'is_charging']):
        group = group.sort_values('Time').reset_index(drop=True)
        features = group[feature_cols].values
        targets = group[target_col].values

        for i in range(len(group) - seq_len):
            X.append(features[i:i+seq_len])
            y.append(targets[i + seq_len])

    return np.array(X), np.array(y)