
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterButtonProps {
  icon: LucideIcon;
  label: string;
  selectedOption: string;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  icon: Icon, 
  label, 
  selectedOption, 
  onClick 
}) => {
  const isActive = selectedOption !== 'Todos';
  
  return (
    <Button 
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={`flex items-center gap-1 ${isActive ? 'bg-arcane text-white' : ''}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {isActive && <span className="text-xs ml-1">({selectedOption})</span>}
    </Button>
  );
};

export default FilterButton;
