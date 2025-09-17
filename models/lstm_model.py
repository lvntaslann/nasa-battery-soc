import torch.nn as nn

class SoCPredictorLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=2, dropout=0.3):
        super(SoCPredictorLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size=input_size, hidden_size=hidden_size,
                            num_layers=num_layers, batch_first=True,
                            dropout=dropout if num_layers > 1 else 0.0)
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        output, (hn, cn) = self.lstm(x)
        last_output = output[:, -1, :]  # (batch, hidden)
        out = self.fc(last_output)
        return out  # (batch, 1)