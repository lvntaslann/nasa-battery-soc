import os
import numpy as np
from utils.data_processing_for_train import load_metadata, combine_csvs, compute_soc_and_delta

class ModelDataPreparer:
    def __init__(self, data_dir, cleaned_dir, model_data_dir, meta_path, train_ratio=0.7, seed=42):
        self.data_dir = os.path.abspath(data_dir)
        self.cleaned_dir = os.path.abspath(cleaned_dir)
        self.model_data_dir = os.path.abspath(model_data_dir)
        self.meta_path = os.path.abspath(meta_path)
        self.train_ratio = train_ratio
        self.seed = seed

        os.makedirs(self.model_data_dir, exist_ok=True)
        print(f"[INFO] DATA_DIR: {self.data_dir}")
        print(f"[INFO] CLEAN_DIR: {self.cleaned_dir}")
        print(f"[INFO] MODEL_DATA_DIR: {self.model_data_dir}")
        print(f"[INFO] META_PATH: {self.meta_path}")

    def prepare(self):
        # Metadata yükle
        meta_df = load_metadata(self.meta_path)
        print(f"[INFO] Metadata loaded: {meta_df.shape[0]} rows")

        # CSV’leri birleştir
        combined_df = combine_csvs(meta_df, self.cleaned_dir)
        print(f"[INFO] Combined DataFrame shape: {combined_df.shape}")

        # SoC ve delta_t hesapla
        combined_df = compute_soc_and_delta(combined_df)
        print("[INFO] SoC computation finished.")

        # NaN kontrolü ve temizleme
        nan_count = combined_df.isna().sum().sum()
        if nan_count > 0:
            print(f"[WARNING] {nan_count} NaN değeri bulundu. Kaydetmeden önce temizleniyor...")
            combined_df = combined_df.dropna().reset_index(drop=True)
        else:
            print("[INFO] NaN değeri bulunamadı.")

        # Train/test split
        batteries = combined_df['battery_id'].unique()
        np.random.seed(self.seed)
        np.random.shuffle(batteries)
        n = len(batteries)
        train_ids = batteries[:int(self.train_ratio*n)]
        test_ids = batteries[int(self.train_ratio*n):]

        train_df = combined_df[combined_df['battery_id'].isin(train_ids)]
        test_df = combined_df[combined_df['battery_id'].isin(test_ids)]

        print(f"[INFO] Train batteries: {train_ids}")
        print(f"[INFO] Test batteries: {test_ids}")

        # CSV kaydetme
        combined_path = os.path.join(self.data_dir, "combined_df.csv")
        train_path = os.path.join(self.model_data_dir, "train_df.csv")
        test_path = os.path.join(self.model_data_dir, "test_df.csv")

        combined_df.to_csv(combined_path, index=False)
        train_df.to_csv(train_path, index=False)
        test_df.to_csv(test_path, index=False)

        print(f"[INFO] Combined CSV saved at: {combined_path}")
        print(f"[INFO] Train CSV saved at: {train_path}")
        print(f"[INFO] Test CSV saved at: {test_path}")

        return combined_df, train_df, test_df
