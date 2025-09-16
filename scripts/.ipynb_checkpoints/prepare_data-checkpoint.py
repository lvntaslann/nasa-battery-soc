import os
import scipy.io
import pandas as pd
import numpy as np
from datetime import datetime
from utils.data_processing import *

CWD = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(CWD, "..", "BatteryAgingARC-FY08Q4"))
CLEAN_DIR = os.path.abspath(os.path.join(CWD, "..", "data", "cleaned_dataset"))
METADATA_PATH = os.path.abspath(os.path.join(CWD, "..", "data", "metadata.csv"))

os.makedirs(CLEAN_DIR, exist_ok=True)

print(f"DATA_DIR: {DATA_DIR}")
print(f"CLEAN_DIR: {CLEAN_DIR}")

FILELIST = filter_matfiles_list(load_filelist(DATA_DIR))
print(f"Found {len(FILELIST)} .mat files to process.")

metadata = pd.DataFrame(columns=['type','start_time','ambient_temperature','battery_id',
                                 'test_id','uid','filename','Capacity','Re','Rct'])

uid = 0

for idx, mat_filepath in enumerate(FILELIST, 1):
    battery_name = os.path.basename(mat_filepath).split('.')[0]
    print(f"\nProcessing {idx}/{len(FILELIST)}: {battery_name}")
    
    mat_data = loadmat(mat_filepath)
    test_list = mat_data[battery_name]['cycle']

    for test_id, test in enumerate(test_list, 1):
        uid += 1
        filename = str(uid).zfill(5) + ".csv"
        filepath = os.path.join(CLEAN_DIR, filename)

        ndict, metadata_dict = process_data_dict(test['data'])
        test_df = pd.DataFrame.from_dict(ndict, orient='index').transpose()
        test_df.to_csv(filepath, index=False)

        test_type = test['type']
        test_start_time = test['time']
        test_temperature = test['ambient_temperature']
        capacity, re, rct = extract_more_metadata(metadata_dict)

        metadata = fill_metadata_row(metadata, test_type, test_start_time, test_temperature,
                                     battery_name, test_id, uid, filename, capacity, re, rct)


metadata['start_time'] = metadata['start_time'].apply(convert_list_to_datetime)
metadata.to_csv(METADATA_PATH, index=False)
print(f"\nAll tests processed. Metadata saved to: {METADATA_PATH}")