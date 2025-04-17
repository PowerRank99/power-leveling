
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export const EXERCISE_TYPES = [
  'Musculação',
  'Calistenia',
  'Cardio',
  'Esportes',
  'Mobilidade & Flexibilidade'
] as const;

export type ExerciseType = typeof EXERCISE_TYPES[number];

interface ExerciseTypeSelectorProps {
  value: ExerciseType | '';
  onChange: (value: ExerciseType) => void;
}

const ExerciseTypeSelector: React.FC<ExerciseTypeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <Label htmlFor="exercise-type">Tipo de Exercício</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value as ExerciseType)}
      >
        <SelectTrigger id="exercise-type" className="bg-midnight-elevated border-arcane/30">
          <SelectValue placeholder="Selecione o tipo de exercício" />
        </SelectTrigger>
        <SelectContent>
          {EXERCISE_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExerciseTypeSelector;
