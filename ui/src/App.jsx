import React, { useEffect, useState } from "react";
import {
  Upload,
  Battery,
  Zap,
  Thermometer,
  Clock,
  TrendingUp,
} from "lucide-react";
import FileUpload from "./components/FileUpload";
import ModelParameters from "./components/ModelParameters";
import DataVisualization from "./components/DataVisualization";
import RealtimeBattery from "./components/RealtimeBattery";
import "./App.css";
import { uploadBatteryData, getBatteryData } from "./services/api";

function App() {
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [currentValues, setCurrentValues] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUploadAlert, setShowUploadAlert] = useState(false);
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState(null);


  const groupByFilename = (entries) => {
    const map = {};
    entries.forEach((e) => {
      if (!map[e.filename]) map[e.filename] = [];
      map[e.filename].push(e);
    });
    return Object.entries(map).map(([filename, results]) => ({
      filename,
      results,
    }));
  };

  const loadHistoryResult = (index) => {
    setSelectedAnalysisIndex(index);
    const selected = groupedData[index].results;
    setCurrentValues(selected[selected.length - 1]);
    setPrediction(selected[selected.length - 1].soc_predicted);
  };

  useEffect(() => {
    getBatteryData().then((res) => {
      setData(res.results);
      const grouped = groupByFilename(res.results);
      setGroupedData(grouped);

      if (grouped.length > 0) {
        const last = grouped[grouped.length - 1].results;
        setCurrentValues(last[last.length - 1]);
        setPrediction(last[last.length - 1].soc_predicted);
        setSelectedAnalysisIndex(grouped.length - 1);
      }
    });
  }, []);

  const handleFileUpload = async (file) => {
    setIsAnalyzing(true);
    try {
      await uploadBatteryData(file);
      setShowUploadAlert(true);
      setTimeout(() => setShowUploadAlert(false), 3000);

      const res = await getBatteryData();
      setData(res.results);
      const grouped = groupByFilename(res.results);
      setGroupedData(grouped);

      if (grouped.length > 0) {
        const last = grouped[grouped.length - 1].results;
        setCurrentValues(last[last.length - 1]);
        setPrediction(last[last.length - 1].soc_predicted);
        setSelectedAnalysisIndex(grouped.length - 1);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Battery className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Batarya Yönetimi
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Elektrikli araç batarya verilerini analiz edin ve SOC tahminlerini
            görüntüleyin
          </p>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Upload className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Batarya Verisi Yükle ve Parametreleri İncele
            </h2>
          </div>
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                {showUploadAlert && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Dosya başarıyla yüklendi! Veriler güncellendi.
                  </div>
                )}
                <FileUpload
                  onFileUpload={handleFileUpload}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Model Açıklaması
              </h3>
              <p className="text-gray-600">
                Modelimiz, SOC (State of Charge) tahmini için sensör verilerini
                kullanmaktadır. JSON dosyanızda uygun sütun isimleri
                bulunmalıdır.
              </p>
            </div>
            <div className="w-full">
              <ModelParameters />
            </div>
          </div>
        </div>


        {/*  MQTT data */}
        <RealtimeBattery />

        {/* Data Visualization */}
        {selectedAnalysisIndex !== null && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <DataVisualization
              selectedAnalysis={
                groupedData[selectedAnalysisIndex]?.results || []
              }
            />
          </div>
        )}

        {/* History List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Analiz Geçmişi</h2>
            <span className="ml-3 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
              {groupedData.length} Analiz
            </span>
          </div>

          <div className="grid gap-4">
            {groupedData.map((entry, index) => (
              <div
                key={index}
                onClick={() => loadHistoryResult(index)}
                className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedAnalysisIndex === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Battery className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    {entry.filename}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* İpucu kutusu */}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>İpucu:</strong> Geçmiş analizlerden birini seçerek o
              analizin detaylarını ve grafiklerini görüntüleyebilirsiniz. Seçili
              analiz mavi renkte vurgulanır ve yukarıdaki grafikler o analize
              ait verileri gösterir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
