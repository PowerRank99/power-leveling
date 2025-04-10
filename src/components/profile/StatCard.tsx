
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
      {value && <span className={`text-xl font-bold font-mono ${light ? "text-ghost" : "text-ghost"}`}>{value}</span>}
      <span className={`text-xs ${light ? "text-ghost-400" : "text-ghost-500"} font-display tracking-wide`}>{label}</span>
    </div>
  );
};

export default StatCard;
