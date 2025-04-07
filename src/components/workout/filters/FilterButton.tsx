
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface FilterButtonProps {
  isActive: boolean;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ isActive, icon: Icon, label, onClick }) => {
  return (
    <Button 
      variant="outline" 
      className={`flex-1 ${isActive ? 'bg-fitblue-50 text-fitblue border-fitblue' : ''}`}
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};

export default FilterButton;
