
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando...', 
  subMessage,
  size = 'md',
  className = ''
}) => {
  const sizeClass = {
    'sm': 'w-4 h-4 border-2',
    'md': 'w-8 h-8 border-4',
    'lg': 'w-12 h-12 border-4'
  }[size];

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className={`animate-spin ${sizeClass} border-fitblue border-t-transparent rounded-full mx-auto mb-2`}></div>
      {message && <p className="text-gray-700 font-medium">{message}</p>}
      {subMessage && <p className="text-gray-500 text-sm mt-1">{subMessage}</p>}
    </div>
  );
};

export default LoadingSpinner;
