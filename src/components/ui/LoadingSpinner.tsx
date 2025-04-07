
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando...', 
  subMessage 
}) => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-fitblue border-t-transparent rounded-full mx-auto mb-2"></div>
      <p className="text-gray-700 font-medium">{message}</p>
      {subMessage && <p className="text-gray-500 text-sm mt-1">{subMessage}</p>}
    </div>
  );
};

export default LoadingSpinner;
