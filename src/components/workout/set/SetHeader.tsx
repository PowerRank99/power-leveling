
import React from 'react';

const SetHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-2 py-2 mb-2">
      <div className="col-span-1 font-medium text-text-tertiary text-sm font-space">#</div>
      <div className="col-span-3 font-medium text-text-tertiary text-sm font-space">Anterior</div>
      <div className="col-span-3 font-medium text-text-tertiary text-center text-sm font-space">Peso (kg)</div>
      <div className="col-span-3 font-medium text-text-tertiary text-center text-sm font-space">Reps</div>
      <div className="col-span-2 font-medium text-text-tertiary text-center text-sm font-space"></div>
    </div>
  );
};

export default SetHeader;
