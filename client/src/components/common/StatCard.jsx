import React from 'react';

const StatCard = ({ title, value, icon, color = 'bg-primary', subtitle }) => {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;