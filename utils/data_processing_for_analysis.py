import os
import scipy.io
import pandas as pd
from datetime import datetime

def load_filelist(data_directory="../BatteryAgingARC-FY08Q4"):
    FILELIST = []
    if os.path.exists(data_directory):
        for dirname, _, filenames in os.walk(data_directory):
            for filename in filenames:
                filepath = os.path.join(dirname, filename)
                FILELIST.append(filepath)
                print(f"Found: {filepath}")
    else:
        raise FileNotFoundError(f"Directory '{data_directory}' not found!")
    return FILELIST

def filter_matfiles_list(filelist):
    return [f for f in filelist if f.endswith('.mat') and "BatteryAgingARC_25_26_27_28_P1" not in f]

def loadmat(filepath):
    return scipy.io.loadmat(filepath, simplify_cells=True)

def process_data_dict(data_dict):
    ndict, metadata_dict = {}, {}
    for k, v in data_dict.items():
        if k not in ['Capacity','Re','Rct']:
            ndict[k] = v
        else:
            metadata_dict[k] = v
    return ndict, metadata_dict

def extract_more_metadata(metadata_dict):
    capacity = metadata_dict.get('Capacity', None)
    re = metadata_dict.get('Re', None)
    rct = metadata_dict.get('Rct', None)
    return capacity, re, rct

def fill_metadata_row(metadata, test_type, test_start_time, test_temperature, battery_name, test_id, uid, filename, capacity, re, rct):
    new_row = pd.DataFrame({
        'type': [test_type],
        'start_time': [test_start_time],
        'ambient_temperature': [test_temperature],
        'battery_id': [battery_name],
        'test_id': [test_id],
        'uid': [uid],
        'filename': [filename],
        'Capacity': [capacity],
        'Re': [re],
        'Rct': [rct]
    })
    for col in metadata.columns:
        if col in new_row.columns:
            new_row[col] = new_row[col].astype(metadata[col].dtype)
        else:
            new_row[col] = np.nan
    return pd.concat([metadata, new_row], ignore_index=True)

def convert_list_to_datetime(lst):
    y, m, d, H, M, S = map(int, lst[:6])
    return datetime(y, m, d, H, M, S)



def generate_metadata(data_dir="../BatteryAgingARC-FY08Q4", output_dir="/app/data/cleaned_dataset"):
    os.makedirs(output_dir, exist_ok=True)
    filelist = filter_matfiles_list(load_filelist(data_dir))
    battery_list = [os.path.basename(item).split('.')[0] for item in filelist]

    metadata = pd.DataFrame()
    uid = 0

    for battery_name, mat_filepath in zip(battery_list, filelist):
        mat_data = loadmat(mat_filepath)
        print(f"{mat_filepath[-10:]} --> {battery_name}")

        test_list = mat_data[battery_name]['cycle']

        for test_id, test in enumerate(test_list):
            uid += 1
            filename = str(uid).zfill(5) + '.csv'
            filepath = os.path.join(output_dir, filename)

            ndict, metadata_dict = process_data_dict(test['data'])
            test_df = pd.DataFrame.from_dict(ndict, orient='index').transpose()
            test_df.to_csv(filepath, index=False)

            test_type = test['type']
            test_start_time = test['time']
            test_temperature = test['ambient_temperature']
            capacity, re, rct = extract_more_metadata(metadata_dict)
            metadata = fill_metadata_row(
                metadata, test_type, test_start_time, test_temperature,
                battery_name, test_id, uid, filename, capacity, re, rct
            )

    metadata['start_time'] = metadata['start_time'].apply(convert_list_to_datetime)
    metadata = metadata.reset_index(drop=True)
    metadata.to_csv('/app/data/metadata.csv', index=False)
    print("[INFO] Metadata CSV oluşturuldu ve test CSV’leri kaydedildi.")
    return metadata
