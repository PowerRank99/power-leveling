
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackIcon } from '../icons/NavIcons';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = true, 
  rightContent 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)}
              className="mr-3 p-1"
              aria-label="Voltar"
            >
              <BackIcon className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
