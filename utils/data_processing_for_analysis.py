import os
import scipy.io
import pandas as pd
import numpy as np
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
    capacity = metadata_dict.get('Capacity', np.nan)
    re = metadata_dict.get('Re', np.nan)
    rct = metadata_dict.get('Rct', np.nan)
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
    return pd.concat([metadata, new_row], ignore_index=True)

def convert_list_to_datetime(lst):
    return datetime(*map(int, lst[:6]))