
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ value, onChange }) => {
  // Get current date in YYYY-MM-DD format for max attribute
  const today = new Date().toISOString().slice(0, 10);
  
  // Calculate the minimum date (24 hours ago)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 1);
  const minDateString = minDate.toISOString().slice(0, 10);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const selectedDateTime = new Date(selectedDate).getTime();
    const nowTime = new Date().getTime();
    
    // Prevent future dates
    if (selectedDateTime > nowTime) {
      onChange(today);
      return;
    }
    
    // Check if date is more than 24 hours in the past
    const hoursDiff = (nowTime - selectedDateTime) / (1000 * 3600);
    
    if (hoursDiff > 24) {
      onChange(minDateString);
      return;
    }
    
    onChange(selectedDate);
  };

  return (
    <div>
      <Label htmlFor="workout-date">Data do Treino</Label>
      <Input
        id="workout-date"
        type="date"
        className="bg-midnight-elevated border-arcane/30"
        value={value}
        onChange={handleDateChange}
        max={today}
        min={minDateString}
      />
      <p className="text-xs text-text-tertiary mt-1">
        *Limite de 24 horas atrás
      </p>
    </div>
  );
};

export default DateSelector;
