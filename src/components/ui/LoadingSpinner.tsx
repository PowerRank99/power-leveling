
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string; // Add className prop
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Carregando...", 
  subMessage,
  size = "md",
  className = "" // Default empty string
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-5 w-5';
      case 'md': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      default: return 'h-8 w-8';
    }
  };
  
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className={`animate-spin ${getSizeClass()} mb-3 border-4 border-transparent border-t-arcane rounded-full shadow-glow-purple`}></div>
      <p className="text-text-primary font-orbitron mb-1">{message}</p>
      {subMessage && <p className="text-text-tertiary text-sm font-sora">{subMessage}</p>}
    </div>
  );
};

export default LoadingSpinner;
