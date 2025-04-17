
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ value, onChange }) => {
  // Get current date in user's timezone
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Calculate the minimum date (24 hours ago)
  const minDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const minDateString = minDate.toISOString().split('T')[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const nowTime = now.getTime();
    
    // Prevent future dates
    if (selectedDate.getTime() > nowTime) {
      onChange(today);
      return;
    }
    
    // Check if date is more than 24 hours in the past
    const hoursDiff = (nowTime - selectedDate.getTime()) / (1000 * 3600);
    
    if (hoursDiff > 24) {
      onChange(minDateString);
      return;
    }
    
    onChange(e.target.value);
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
