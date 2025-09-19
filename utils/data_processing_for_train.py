import os
import pandas as pd
import numpy as np

def load_metadata(meta_path):
    """Metadata CSV dosyasını yükler ve Capacity kolonunu sayısal hale çevirir."""
    print(f"[INFO] Loading metadata from {meta_path}")
    meta_df = pd.read_csv(meta_path)
    meta_df['Capacity'] = pd.to_numeric(meta_df['Capacity'], errors='coerce')
    return meta_df

def build_capacity_dict(meta_df):
    """Her batarya için maksimum kapasiteyi hesaplar ve sözlük olarak döner."""
    capacities_df = meta_df[meta_df['type']=='discharge'][['battery_id','Capacity']]
    cap_dict = {}
    for bid in capacities_df['battery_id'].unique():
        battery_df = capacities_df[capacities_df['battery_id']==bid]
        capacity = battery_df['Capacity'].dropna().max() if 'Capacity' in battery_df.columns else 0.0
        cap_dict[bid] = capacity
    return cap_dict

def combine_csvs(meta_df, clean_dir):
    """Metadata ve temiz CSV dosyalarını birleştirerek tek DataFrame döner."""
    print("[INFO] Combining individual CSVs...")
    filtered_df = meta_df[meta_df['type'] != 'impedance'].fillna(1e-6)
    cap_dict = build_capacity_dict(meta_df)
    
    dfs = []
    for _, row in filtered_df.iterrows():
        file_path = os.path.join(clean_dir, row['filename'])
        df = pd.read_csv(file_path)
        df = df[['Voltage_measured','Current_measured','Temperature_measured','Time']]
        df['battery_id'] = row['battery_id']
        df['is_charging'] = int(row['type']=='charge')
        df['Capacity'] = row['Capacity'] if row['type']=='discharge' else cap_dict[row['battery_id']]
        dfs.append(df)
    combined_df = pd.concat(dfs, ignore_index=True)
    print(f"[INFO] Combined DataFrame shape: {combined_df.shape}")
    return combined_df

def compute_soc_and_delta(df, time_col='Time', current_col='Current_measured',
                          flag_col='is_charging', battery_col='battery_id',
                          initial_soc=0.5, cap_col='Capacity'):
    """SoC ve delta_t hesaplar."""
    print("[INFO] Computing SoC and delta_t...")
    df = df.copy()
    df = df.sort_values([battery_col, flag_col, time_col]).reset_index(drop=True)
    
    # delta_t
    df['delta_t'] = df.groupby([battery_col, flag_col])[time_col].diff().fillna(1e-4)
    df['delta_t'] = df['delta_t'].apply(lambda x: x if x > 0 else 1e-4)

    # delta Ah
    df['delta_Ah'] = (df[current_col] * df['delta_t']) / 3600.0
    df['delta_Ah_signed'] = df['delta_Ah'] * df[flag_col].apply(lambda x: -1 if x else 1)
    df['comb_Ah'] = df.groupby(battery_col)['delta_Ah_signed'].cumsum()

    battery_capacity = df.groupby(battery_col)[cap_col].max().to_dict()
    df['battery_capacity'] = df[battery_col].map(battery_capacity)
    if df['battery_capacity'].isna().any():
        raise ValueError("Missing Battery Capacity.")

    # SoC
    df['SoC'] = initial_soc + (df['comb_Ah'] / df['battery_capacity'])
    df['SoC'] = df['SoC'].clip(0,1)

    df.drop(['delta_Ah','delta_Ah_signed','comb_Ah','battery_capacity'], axis=1, inplace=True)
    print("[INFO] SoC computation finished.")
    return df

def create_train_test_csv(meta_path='/app/data/metadata.csv', clean_dir='/app/data/cleaned_dataset',
                          save_dir='/app/data/model_data/', train_ratio=0.7, random_seed=42):
    """Tüm pipeline: metadata + CSV birleştir, SoC hesapla, train/test split, CSV kaydet."""
    os.makedirs(save_dir, exist_ok=True)

    meta_df = load_metadata(meta_path)
    combined_df = combine_csvs(meta_df, clean_dir)
    combined_df = compute_soc_and_delta(combined_df)

    batteries = combined_df['battery_id'].unique()
    np.random.seed(random_seed)
    np.random.shuffle(batteries)

    n = len(batteries)
    train_ids = batteries[: int(train_ratio * n)]
    test_ids  = batteries[int(train_ratio * n):]
    meta_dir = os.path.dirname(meta_path)
    combined_df.to_csv(os.path.join(meta_dir, "combined_df.csv"), index=False)
    train_df = combined_df[combined_df['battery_id'].isin(train_ids)]
    test_df  = combined_df[combined_df['battery_id'].isin(test_ids)]

    train_df.to_csv(os.path.join(save_dir, "train_df.csv"), index=False)
    test_df.to_csv(os.path.join(save_dir, "test_df.csv"), index=False)

    print(f"[INFO] Train batteries: {train_ids}")
    print(f"[INFO] Test batteries: {test_ids}")
    print("[INFO] Train/test CSV’leri kaydedildi.")

    return train_df, test_df
