import React, { useState } from "react";
import {
  Upload,
  Battery,
  Zap,
  Thermometer,
  Clock,
  TrendingUp,
} from "lucide-react";
import FileUpload from "./components/FileUpload";
import SOCGauge from "./components/SOCGauge";
import MetricCard from "./components/MetricCard";
import ModelParameters from "./components/ModelParameters";
import DataVisualization from "./components/DataVisualization";
import "./App.css";
import { uploadBatteryData } from "./services/api";

function App() {
  const [uploadedData, setUploadedData] = useState(null);
  const [currentValues, setCurrentValues] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionList, setPredictionList] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [showUploadAlert, setShowUploadAlert] = useState(false);

  const handleFileUpload = async (file) => {
    setIsAnalyzing(true);
    try {
      const result = await uploadBatteryData(file);

      const lastPrediction = result.prediction[result.prediction.length - 1][0];
      const allPredictions = result.prediction.map((p) => p[0]);

      setUploadedData(result.data);
      setCurrentValues(result.data[result.data.length - 1]);
      setPrediction([lastPrediction]);
      setPredictionList(allPredictions);
      setIsAnalyzing(false);

      setShowUploadAlert(true);
      setTimeout(() => setShowUploadAlert(false), 3000);

      setAnalysisHistory((prev) => [
        ...prev,
        {
          id: prev.length,
          fileName: file.name,
          timestamp: new Date(),
          data: result.data,
          currentValues: result.data[result.data.length - 1],
          prediction: result.prediction,
          predictionList: allPredictions,
          dataPoints: result.data.length,
          avgSOC: result.avg_SOC,
          avgVoltage: result.avg_voltage,
          chargingRatio: result.charging_ratio,
        },
      ]);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
      alert(error.message);
    }
  };

  const loadHistoryResult = (index) => {
    const result = analysisHistory[index];
    setUploadedData(result.data);
    setCurrentValues(result.currentValues);
    setPrediction([result.prediction[result.prediction.length - 1][0]]);
    setPredictionList(result.predictionList);
    setSelectedHistoryIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
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

        {/* Data Upload and Model Parameters */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Upload className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Batarya Verisi Yükle ve Parametreleri İncele
            </h2>
          </div>

          <div className="space-y-8">
            {/* File Upload + Alert */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                {showUploadAlert && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Dosya başarıyla yüklendi! Anlık batarya durumu ve tahmin
                    kısmında görüntüleyebilirsiniz.
                  </div>
                )}
                <FileUpload
                  onFileUpload={handleFileUpload}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>

            {/* Model Description */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Model Açıklaması
              </h3>
              <p className="text-gray-600">
                Modelimiz, SOC (State of Charge) tahmini için aşağıdaki sensör
                verilerini kullanmaktadır. Excel dosyanız bu sütun isimlerini
                içermelidir.
              </p>
            </div>

            {/* Model Parameters */}
            <div className="w-full">
              <ModelParameters />
            </div>
          </div>
        </div>

        {/* Current Status and Prediction */}
        {currentValues && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Anlık Batarya Durumu ve Tahmin
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <SOCGauge
                  value={(prediction?.[0] || 0) * 100}
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    icon={<Zap className="w-5 h-5" />}
                    title="Voltaj"
                    value={`${currentValues.Voltage_measured.toFixed(2)} V`}
                    color="text-yellow-600"
                    bgColor="bg-yellow-50"
                  />
                  <MetricCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    title="Akım"
                    value={`${currentValues.Current_measured.toFixed(2)} A`}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                  />
                  <MetricCard
                    icon={<Thermometer className="w-5 h-5" />}
                    title="Sıcaklık"
                    value={`${currentValues.Temperature_measured.toFixed(1)} °C`}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                  />
                  <MetricCard
                    icon={<Battery className="w-5 h-5" />}
                    title="Şarj Durumu"
                    value={currentValues.is_charging ? "Şarj Ediliyor" : "Şarj Edilmiyor"}
                    color={currentValues.is_charging ? "text-green-600" : "text-red-600"}
                    bgColor={currentValues.is_charging ? "bg-green-50" : "bg-red-50"}
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Tahmin Sonucu
                  </h3>
                  <p className="text-gray-600">
                    Mevcut sensör verilerine dayanarak, batarya şarj seviyesi{" "}
                    <span className="font-bold text-blue-600">
                      %{(prediction?.[0] * 100).toFixed(1)}
                    </span>{" "}
                    olarak tahmin edilmektedir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Visualization */}
        {uploadedData && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <DataVisualization
              data={uploadedData}
              predictions={predictionList}
            />
          </div>
        )}

        {/* Analysis History */}
        {analysisHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Analiz Geçmişi
              </h2>
              <span className="ml-3 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                {analysisHistory.length} Analiz
              </span>
            </div>

            <div className="grid gap-4">
              {analysisHistory.map((result, index) => (
                <div
                  key={result.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedHistoryIndex === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => loadHistoryResult(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Battery className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{result.fileName}</h3>
                        <p className="text-sm text-gray-500">
                          {result.timestamp.toLocaleDateString("tr-TR")} -{" "}
                          {result.timestamp.toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">SOC Tahmini</p>
                        <p className="text-lg font-bold text-green-600">
                          {(result.prediction[result.prediction.length-1][0]*100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Veri Noktası</p>
                        <p className="text-lg font-bold text-blue-600">{result.dataPoints}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Ort. SOC</p>
                        <p className="text-lg font-bold text-purple-600">
                          {result.avgSOC.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Şarj Oranı</p>
                        <p className="text-lg font-bold text-orange-600">{result.chargingRatio.toFixed(0)}%</p>
                      </div>
                      {selectedHistoryIndex === index && (
                        <div className="text-blue-600">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <strong>İpucu:</strong> Geçmiş analizlerden birini seçerek o
                analizin detaylarını ve grafiklerini görüntüleyebilirsiniz.
                Seçili analiz mavi renkte vurgulanır ve yukarıdaki grafikler o
                analize ait verileri gösterir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
