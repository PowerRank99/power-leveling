
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
      {value && <span className="text-xl font-space font-bold text-text-primary">{value}</span>}
      <span className="text-xs font-sora text-text-tertiary">{label}</span>
    </div>
  );
};

export default StatCard;
