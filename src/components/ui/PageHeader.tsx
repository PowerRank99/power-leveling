
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackIcon } from '../icons/NavIcons';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  onBackClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = true, 
  rightContent,
  onBackClick
}) => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="sticky top-0 bg-midnight-base border-b border-divider z-10 shadow-subtle">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={handleBackClick}
              className="mr-3 p-1 text-text-secondary hover:text-arcane transition-colors"
              aria-label="Voltar"
            >
              <BackIcon className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-orbitron font-bold text-text-primary">{title}</h1>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
