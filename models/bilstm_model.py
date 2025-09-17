import torch.nn as nn

class BiLSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=2):
        super(BiLSTMModel, self).__init__()
        self.bilstm = nn.LSTM(input_size=input_size, hidden_size=hidden_size,
                              num_layers=num_layers, batch_first=True,
                              bidirectional=True,
                              dropout=0.0 if num_layers == 1 else 0.3)
        self.fc = nn.Sequential(
            nn.Linear(hidden_size * 2, 64),  # bidirectional -> hidden*2
            nn.ReLU(),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        lstm_out, _ = self.bilstm(x)
        last_out = lstm_out[:, -1, :]  # (batch, hidden*2)
        out = self.fc(last_out)
        return out  # (batch, 1)