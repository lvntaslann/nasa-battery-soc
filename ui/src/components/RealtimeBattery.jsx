import React, { useEffect, useState } from "react";
import SOCGauge from "./SOCGauge";
import MetricCard from "./MetricCard";
import { Battery, Zap, Thermometer, TrendingUp } from "lucide-react";

const BASE_URL = "http://localhost:8000";

const RealtimeBattery = () => {
  const [currentData, setCurrentData] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/mqtt_predict`);
        const data = await res.json();

        if (data.soc_predicted !== undefined) {
          setCurrentData(data.data);
          setPrediction(data.soc_predicted);
        }
      } catch (err) {
        console.error("MQTT verisi alınamadı:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1500);

    return () => clearInterval(interval);
  }, []);

  if (!currentData) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">
          Anlık Batarya Durumu (MQTT)
        </h2>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <SOCGauge value={parseFloat(((prediction || 0) * 100).toFixed(5))} />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={<Zap className="w-5 h-5" />}
              title="Voltaj"
              value={`${currentData.Voltage_measured?.toFixed(4) ?? 0} V`}
              color="text-yellow-600"
              bgColor="bg-yellow-50"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Akım"
              value={`${currentData.Current_measured?.toFixed(4) ?? 0} A`}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <MetricCard
              icon={<Thermometer className="w-5 h-5" />}
              title="Sıcaklık"
              value={`${currentData.Temperature_measured?.toFixed(4) ?? 0} °C`}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
            <MetricCard
              icon={<Battery className="w-5 h-5" />}
              title="Şarj Durumu"
              value={currentData.is_charging ? "Şarj Ediliyor" : "Şarj Edilmiyor"}
              color={currentData.is_charging ? "text-green-600" : "text-red-600"}
              bgColor={currentData.is_charging ? "bg-green-50" : "bg-red-50"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeBattery;
