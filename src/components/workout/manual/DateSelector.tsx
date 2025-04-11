
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <Label htmlFor="workout-date">Data do Treino</Label>
      <Input
        id="workout-date"
        type="date"
        className="bg-midnight-elevated border-arcane/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={new Date().toISOString().slice(0, 10)}
      />
      <p className="text-xs text-text-tertiary mt-1">
        *Limite de 24 horas atrás
      </p>
    </div>
  );
};

export default DateSelector;
