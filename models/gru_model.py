import torch.nn as nn

class GRUModel(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2):
        super(GRUModel, self).__init__()
        self.gru = nn.GRU(input_size=input_size, hidden_size=hidden_size,
                          num_layers=num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        _, h_n = self.gru(x)       # h_n: (num_layers, batch, hidden)
        last_h = h_n[-1]           # son layer -> (batch, hidden)
        out = self.fc(last_h)      # (batch, 1)
        return out