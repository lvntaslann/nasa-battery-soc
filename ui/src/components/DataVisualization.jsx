import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

const tabInfo = {
  soc: "SOC (State of Charge) tahmini, bataryanın şarj seviyesini gösterir.",
  voltage: "Voltaj ölçümleri, batarya hücrelerindeki gerilimi temsil eder.",
  current: "Akım ölçümleri, bataryadan geçen akımı gösterir.",
  temperature: "Sıcaklık ölçümleri, bataryanın termal durumunu gösterir."
};

const DataVisualization = ({ selectedAnalysis }) => {
  const [activeTab, setActiveTab] = useState("soc");
  const [hoverPoint, setHoverPoint] = useState(null);
  const [chartData, setChartData] = useState([]);

  const svgWidth = 800;
  const svgHeight = 250;

  useEffect(() => {
    if (!selectedAnalysis) return;

    let chartArray = [];
    switch (activeTab) {
      case "soc":
        chartArray = selectedAnalysis.map((d, i) => ({ value: d.soc_predicted, index: i }));
        break;
      case "voltage":
        chartArray = selectedAnalysis.map((d, i) => ({ value: d.voltage_measured, index: i }));
        break;
      case "current":
        chartArray = selectedAnalysis.map((d, i) => ({ value: d.current_measured, index: i }));
        break;
      case "temperature":
        chartArray = selectedAnalysis.map((d, i) => ({ value: d.temperature_measured, index: i }));
        break;
      default:
        chartArray = [];
    }

    setChartData(chartArray);
  }, [activeTab, selectedAnalysis]);

  const getColor = () => {
    switch (activeTab) {
      case "soc": return "#22c55e";
      case "voltage": return "#facc15";
      case "current": return "#a855f7";
      case "temperature": return "#f97316";
      default: return "#6b7280";
    }
  };

  const getUnit = () => {
    switch (activeTab) {
      case "soc": return "%";
      case "voltage": return "V";
      case "current": return "A";
      case "temperature": return "°C";
      default: return "";
    }
  };

  const points = chartData.map((p, i) => {
    const x = (i / (chartData.length - 1 || 1)) * svgWidth;
    const values = chartData.map((c) => c.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const y = svgHeight - ((p.value - min) / (max - min || 1)) * svgHeight;
    const displayValue = activeTab === "soc" ? p.value * 100 : p.value;
    return { x, y, value: displayValue };
  });

  const pathStr = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    let closestPoint = null;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (mouseX >= p1.x && mouseX <= p2.x) {
        const ratio = (mouseX - p1.x) / (p2.x - p1.x);
        const y = p1.y + ratio * (p2.y - p1.y);
        const value = p1.value + ratio * (p2.value - p1.value);
        closestPoint = { x: mouseX, y, value };
        break;
      }
    }
    setHoverPoint(closestPoint);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-6 h-6 text-green-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Geçmiş Veri ve Model Doğrulama</h2>
      </div>

      {/* Tab buttons */}
      <div className="flex space-x-2 mb-4 bg-gray-100 rounded-xl p-1">
        {Object.keys(tabInfo).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === tab ? "bg-white text-blue-600 shadow" : "text-gray-600"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Graph container */}
      <div className="bg-white rounded-xl p-4 shadow border border-gray-200 w-full max-w-4xl relative">
        <svg
          width="100%"
          height={svgHeight}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <path d={pathStr} fill="none" stroke={getColor()} strokeWidth="3" />
          {hoverPoint && (
            <>
              <circle cx={hoverPoint.x} cy={hoverPoint.y} r={5} fill={getColor()} />
              <text x={hoverPoint.x + 10} y={hoverPoint.y - 10} fill="black" fontSize={12}>
                {hoverPoint.value.toFixed(1)}{getUnit()}
              </text>
            </>
          )}
        </svg>

        {/* Graph info / description */}
        <div className="mt-4 text-gray-700 text-sm">
          {tabInfo[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
