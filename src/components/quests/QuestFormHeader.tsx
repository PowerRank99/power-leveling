
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

interface QuestFormHeaderProps {
  title: string;
  onBackClick: () => void;
}

const QuestFormHeader: React.FC<QuestFormHeaderProps> = ({ 
  title, 
  onBackClick 
}) => {
  return (
    <div className="sticky top-0 z-10 bg-midnight-base border-b border-divider shadow-subtle">
      <div className="p-4 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="text-text-secondary hover:text-arcane hover:bg-arcane-15"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-arcane" />
          <h1 className="text-xl font-orbitron font-bold text-text-primary">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default QuestFormHeader;
