import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

const DataVisualization = ({ data, predictions }) => {
  const [activeTab, setActiveTab] = useState("soc");
  const [hoverPoint, setHoverPoint] = useState(null);
  const [chartData, setChartData] = useState([]);
  const svgWidth = 800;
  const svgHeight = 200;

  useEffect(() => {
    if (!data) return;

    switch (activeTab) {
      case "soc":
        if (!predictions) {
          setChartData([]);
        } else {
          setChartData(
            predictions.map((val, i) => ({ value: val, index: i }))
          );
        }
        break;
      case "voltage":
        setChartData(data.map((item, i) => ({ value: item.Voltage_measured, index: i })));
        break;
      case "current":
        setChartData(data.map((item, i) => ({ value: item.Current_measured, index: i })));
        break;
      case "temperature":
        setChartData(data.map((item, i) => ({ value: item.Temperature_measured, index: i })));
        break;
      default:
        setChartData([]);
    }
  }, [activeTab, data, predictions]);

  const getColor = () => {
    switch (activeTab) {
      case "soc": return "green";
      case "voltage": return "yellow";
      case "current": return "purple";
      case "temperature": return "orange";
      default: return "gray";
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

  // Grafikteki noktaları hesapla
  const points = chartData.map((p, i) => {
    const x = (i / (chartData.length - 1)) * svgWidth;
    const values = chartData.map((c) => c.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const y = svgHeight - ((p.value - min) / (max - min || 1)) * svgHeight;

    // SOC için 0-1 -> 0-100
    let displayValue = p.value;
    if (activeTab === "soc") displayValue = p.value * 100;

    return { x, y, value: displayValue };
  });

  const pathStr = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");

  // Hover işlemi
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    let closestPoint = null;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Line segmenti üzerindeyse interpolasyon yap
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
    <div>
      <div className="flex items-center mb-6">
        <BarChart3 className="w-6 h-6 text-green-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Geçmiş Veri ve Model Doğrulama</h2>
      </div>

      {/* Tablar */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
        {["soc","voltage","current","temperature"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg ${activeTab===tab?"bg-white text-blue-600":"text-gray-600"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grafik */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
        <svg
          width="100%"
          height={svgHeight}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <path d={pathStr} fill="none" stroke={getColor()} strokeWidth="3" />
          
          {hoverPoint && (
            <>
              <circle cx={hoverPoint.x} cy={hoverPoint.y} r={4} fill={getColor()} />
              <text x={hoverPoint.x + 10} y={hoverPoint.y - 10} fill="black" fontSize={12}>
                {hoverPoint.value.toFixed(1)}{getUnit()}
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default DataVisualization;
