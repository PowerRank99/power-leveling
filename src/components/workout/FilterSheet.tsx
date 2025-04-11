
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import FilterButton from './filters/FilterButton';
import { LucideIcon } from 'lucide-react';

interface FilterSheetProps {
  title: string;
  options: string[];
  selectedOption: string;
  icon: LucideIcon;
  label: string;
  onOptionSelect: (option: string) => void;
}

const FilterSheet: React.FC<FilterSheetProps> = ({ 
  title, 
  options, 
  selectedOption, 
  icon, 
  label, 
  onOptionSelect 
}) => {
  // Always ensure we have the "Todos" option
  const allOptions = options.includes('Todos') ? [...options] : ['Todos', ...options];
  
  // Debug information
  console.log(`FilterSheet rendering with selectedOption: ${selectedOption}`);
  console.log('Available options:', allOptions);

  const handleOptionSelect = (option: string) => {
    console.log(`Selected filter option: ${option}`);
    onOptionSelect(option);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div>
          <FilterButton 
            icon={icon} 
            label={label}
            selectedOption={selectedOption}
            onClick={() => {}} // Empty function since this is just a trigger
          />
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {allOptions.map(option => (
            <SheetClose key={option} asChild>
              <Button 
                variant={selectedOption === option ? "default" : "outline"}
                className="justify-start"
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </Button>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
