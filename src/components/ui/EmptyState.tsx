
import React from 'react';
import { AlertCircle, Search, ClipboardList, Users, Trophy, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'AlertCircle' | 'Search' | 'ClipboardList' | 'Users' | 'Trophy' | 'FileText';
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = 'AlertCircle', 
  title, 
  description, 
  action 
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'AlertCircle': return <AlertCircle className="h-12 w-12 text-text-tertiary" />;
      case 'Search': return <Search className="h-12 w-12 text-text-tertiary" />;
      case 'ClipboardList': return <ClipboardList className="h-12 w-12 text-text-tertiary" />;
      case 'Users': return <Users className="h-12 w-12 text-text-tertiary" />;
      case 'Trophy': return <Trophy className="h-12 w-12 text-text-tertiary" />;
      case 'FileText': return <FileText className="h-12 w-12 text-text-tertiary" />;
      default: return <AlertCircle className="h-12 w-12 text-text-tertiary" />;
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-midnight-card border border-divider rounded-xl text-center shadow-subtle">
      <div className="bg-midnight-elevated p-4 rounded-full mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-orbitron mb-2 text-text-primary">{title}</h3>
      <p className="text-text-secondary font-sora mb-4 max-w-xs">{description}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;
