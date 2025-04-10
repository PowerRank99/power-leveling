
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackIcon } from '../icons/NavIcons';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  onBackClick?: () => void;
  showThemeToggle?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = true, 
  rightContent,
  onBackClick,
  showThemeToggle = false
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
    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={handleBackClick}
              className="mr-3 p-1 text-gray-800 dark:text-gray-200"
              aria-label="Voltar"
            >
              <BackIcon className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold dark:text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {showThemeToggle && <ThemeToggle />}
          {rightContent && rightContent}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
