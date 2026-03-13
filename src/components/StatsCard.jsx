import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = "primary" }) => {
  const colorMap = {
    primary: "bg-blue-50 text-blue-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-orange-50 text-orange-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      </div>
      {Icon && (
        <div className={`p-4 rounded-full ${colorMap[color] || colorMap.primary}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatsCard;
