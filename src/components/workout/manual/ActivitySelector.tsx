
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ActivitySelector: React.FC<ActivitySelectorProps> = ({ value, onChange }) => {
  const activityTypes = [
    { value: 'strength', label: 'Musculação' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'running', label: 'Corrida' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'sports', label: 'Esportes' },
    { value: 'bodyweight', label: 'Calistenia' },
    { value: 'flexibility', label: 'Flexibilidade' },
    { value: 'other', label: 'Outro' }
  ];
  
  return (
    <div>
      <Label htmlFor="activity-type">Tipo de Atividade</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-midnight-elevated border-arcane/30">
          <SelectValue placeholder="Escolha o tipo de atividade" />
        </SelectTrigger>
        <SelectContent className="bg-midnight-elevated border-arcane/30">
          {activityTypes.map(type => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ActivitySelector;
