
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import FilterButton from './FilterButton';
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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div>
          <FilterButton 
            isActive={selectedOption !== 'Todos'} 
            icon={icon} 
            label={selectedOption === 'Todos' ? label : selectedOption}
          />
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {options.map(option => (
            <SheetClose key={option} asChild>
              <Button 
                variant={selectedOption === option ? "default" : "outline"}
                className="justify-start"
                onClick={() => {
                  console.log(`Selected option: ${option}`);
                  onOptionSelect(option);
                }}
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
