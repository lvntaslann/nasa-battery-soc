import torch
import numpy as np
from tqdm import tqdm

def train_model(model, train_loader, test_loader, optimizer, loss_fn, scheduler, num_epochs, device, fig_path):
    train_losses_all, test_losses_all = [], []

    print(f"Training started... Total epochs: {num_epochs}")
    
    for epoch in range(num_epochs):
        model.train()
        train_losses = []

        for X_batch, y_batch in tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}", leave=False):
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            y_batch = y_batch.view(-1, 1)  # target boyutu sabit

            optimizer.zero_grad()
            preds = model(X_batch)
            loss = loss_fn(preds, y_batch)
            loss.backward()
            optimizer.step()

            train_losses.append(loss.item())

        model.eval()
        test_losses = []
        with torch.no_grad():
            for X_batch, y_batch in test_loader:
                X_batch, y_batch = X_batch.to(device), y_batch.to(device)
                y_batch = y_batch.view(-1, 1)
                preds = model(X_batch)
                test_losses.append(loss_fn(preds, y_batch).item())

        train_loss = np.mean(train_losses)
        test_loss = np.mean(test_losses)

        train_losses_all.append(train_loss)
        test_losses_all.append(test_loss)

        scheduler.step(test_loss)
    return model