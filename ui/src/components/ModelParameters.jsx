import React from 'react';
import { Zap, TrendingUp, Thermometer, Clock, Battery, Target } from 'lucide-react';

const ModelParameters = () => {
  const inputFeatures = [
    {
      name: 'SoC (önceki)',
      description: 'Bir önceki zaman adımındaki şarj seviyesi (%)',
      icon: <Target className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: 'Voltage_measured',
      description: 'Ölçülen voltaj değeri (V)',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Current_measured',
      description: 'Ölçülen akım değeri (A)',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Temperature_measured',
      description: 'Ölçülen sıcaklık değeri (°C)',
      icon: <Thermometer className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'delta_t',
      description: 'Zaman farkı (saniye)',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'is_charging',
      description: 'Şarj durumu (0/1)',
      icon: <Battery className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const targetColumn = {
    name: 'SoC (sonraki)',
    description: 'Tahmin edilmek istenen şarj seviyesi (%)',
    icon: <Target className="w-5 h-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Features */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
          Girdi Parametreleri (FEATURE_COLS)
        </h3>
        <div className="space-y-2">
          {inputFeatures.map((feature, index) => (
            <div 
              key={index}
              className={`${feature.bgColor} rounded-lg p-2 border-l-4 border-l-blue-400 hover:shadow-sm transition-shadow duration-200`}
            >
              <div className="flex items-center space-x-2">
                <div className={`${feature.color} ${feature.bgColor} p-1 rounded`}>
                  {feature.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{feature.name}</p>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Column */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
          <Target className="w-4 h-4 text-red-600 mr-2" />
          Hedef Parametre (TARGET_COL)
        </h3>
        <div className={`${targetColumn.bgColor} rounded-lg p-2 border-l-4 border-l-red-400 hover:shadow-sm transition-shadow duration-200`}>
          <div className="flex items-center space-x-2">
            <div className={`${targetColumn.color} ${targetColumn.bgColor} p-1 rounded`}>
              {targetColumn.icon}
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">{targetColumn.name}</p>
              <p className="text-xs text-gray-600">{targetColumn.description}</p>
            </div>
          </div>
        </div>
        
        {/* Additional info for target */}
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Model, geçmiş SoC ve diğer parametrelerden öğrenerek <b>bir sonraki zaman adımındaki SoC değerini</b> tahmin eder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelParameters;
