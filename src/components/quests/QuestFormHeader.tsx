
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface QuestFormHeaderProps {
  title: string;
  onBackClick: () => void;
}

const QuestFormHeader: React.FC<QuestFormHeaderProps> = ({ 
  title, 
  onBackClick 
}) => {
  return (
    <div className="p-4 flex items-center gap-2 border-b">
      <Button variant="ghost" size="icon" onClick={onBackClick} className="text-black">
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
};

export default QuestFormHeader;
