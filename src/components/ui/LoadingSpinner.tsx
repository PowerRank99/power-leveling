
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Carregando...' }) => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-fitblue border-t-transparent rounded-full mx-auto mb-2"></div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
