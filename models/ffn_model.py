import torch.nn as nn

class FFNModel(nn.Module):
    def __init__(self, input_size, seq_len, hidden_size=64):
        super(FFNModel, self).__init__()
        self.flattened_input_size = input_size * seq_len

        self.fc1 = nn.Linear(self.flattened_input_size, hidden_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.3)
        self.fc2 = nn.Linear(hidden_size, 1)  # Output is scalar SoC

    def forward(self, x):
        x = x.view(x.size(0), -1)  # Flatten (batch_size, seq_len * features)
        x = self.fc1(x)
        x = self.relu(x)
        x = self.dropout(x)
        out = self.fc2(x)
        return out