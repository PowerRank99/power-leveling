
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  light?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, light = false }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1">
        {icon}
      </div>
      {value && <span className={`text-xl font-ibm-plex font-bold ${light ? "text-white" : "text-gray-800 dark:text-white"}`}>{value}</span>}
      <span className={`text-xs font-inter ${light ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{label}</span>
    </div>
  );
};

export default StatCard;
