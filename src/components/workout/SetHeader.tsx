
import React from 'react';

const SetHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-2 mb-3 text-sm font-medium text-gray-500">
      <div className="col-span-1">SET</div>
      <div className="col-span-3">PREVIOUS</div>
      <div className="col-span-3 text-center">KG</div>
      <div className="col-span-3 text-center">REPS</div>
      <div className="col-span-2 text-center">ACTIONS</div>
    </div>
  );
};

export default SetHeader;
