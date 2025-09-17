import React from 'react';

const MetricCard = ({ icon, title, value, color, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center space-x-3">
        <div className={`${color} ${bgColor} p-2 rounded-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;