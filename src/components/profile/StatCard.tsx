
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1">
        {icon}
      </div>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
};

export default StatCard;
