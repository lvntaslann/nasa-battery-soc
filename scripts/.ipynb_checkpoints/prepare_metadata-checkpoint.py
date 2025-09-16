import os
import scipy.io
import pandas as pd
import numpy as np
from datetime import datetime
from utils.data_processing_for_analysis import *

class BatteryDataPreparer:
    def __init__(self, data_dir, cleaned_dir, metadata_path):
        self.data_dir = os.path.abspath(data_dir)
        self.cleaned_dir = os.path.abspath(cleaned_dir)
        self.metadata_path = os.path.abspath(metadata_path)

        os.makedirs(self.cleaned_dir, exist_ok=True)
        self.metadata = pd.DataFrame(columns=[
            'type', 'start_time', 'ambient_temperature', 'battery_id',
            'test_id', 'uid', 'filename', 'Capacity', 'Re', 'Rct'
        ])
        self.uid = 0

        print(f"[INFO] DATA_DIR: {self.data_dir}")
        print(f"[INFO] CLEAN_DIR: {self.cleaned_dir}")
        print(f"[INFO] METADATA_PATH: {self.metadata_path}")

    def process_all(self):
        filelist = filter_matfiles_list(load_filelist(self.data_dir))
        print(f"[INFO] Found {len(filelist)} .mat files to process.")

        for idx, mat_filepath in enumerate(filelist, 1):
            battery_name = os.path.basename(mat_filepath).split('.')[0]
            print(f"\n[INFO] Processing {idx}/{len(filelist)}: {battery_name}")

            mat_data = loadmat(mat_filepath)
            test_list = mat_data[battery_name]['cycle']

            for test_id, test in enumerate(test_list, 1):
                self.uid += 1
                filename = str(self.uid).zfill(5) + ".csv"
                filepath = os.path.join(self.cleaned_dir, filename)

                ndict, metadata_dict = process_data_dict(test['data'])
                test_df = pd.DataFrame.from_dict(ndict, orient='index').transpose()
                test_df.to_csv(filepath, index=False)

                test_type = test['type']
                test_start_time = test['time']
                test_temperature = test['ambient_temperature']
                capacity, re, rct = extract_more_metadata(metadata_dict)

                self.metadata = fill_metadata_row(
                    self.metadata, test_type, test_start_time, test_temperature,
                    battery_name, test_id, self.uid, filename, capacity, re, rct
                )

        self.metadata['start_time'] = self.metadata['start_time'].apply(convert_list_to_datetime)
        self.metadata.to_csv(self.metadata_path, index=False)
        print(f"\n[INFO] All tests processed. Metadata saved to: {self.metadata_path}")