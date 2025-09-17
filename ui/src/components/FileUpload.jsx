import React, { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";

const FileUpload = ({ onFileUpload, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileUpload(e.dataTransfer.files[0]);
      }
    },
    [onFileUpload]
  );

  const handleChange = useCallback(
    (e) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        onFileUpload(e.target.files[0]);
        e.target.value = "";
      }
    },
    [onFileUpload]
  );

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        } ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".json"
          onChange={handleChange}
          disabled={isAnalyzing}
        />

        <div className="space-y-4">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  Analiz Ediliyor...
                </p>
                <p className="text-sm text-gray-500">
                  Veriler işleniyor, lütfen bekleyiniz
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                {dragActive ? (
                  <FileSpreadsheet className="w-12 h-12 text-blue-600" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  JSON dosyasını sürükleyip bırakın
                </p>
                <p className="text-sm text-gray-500">
                  veya{" "}
                  <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                    dosya seçmek için tıklayın
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Desteklenen format: .json
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p className="font-medium">Gerekli alanlar:</p>
        <p>
          Voltage_measured, Current_measured, Temperature_measured, delta_t,
          is_charging
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
