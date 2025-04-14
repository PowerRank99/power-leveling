
import React from 'react';
import { ExerciseType } from '@/components/workout/types/Exercise';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExerciseEditFormProps {
  selectedType: ExerciseType;
  onTypeChange: (type: ExerciseType) => void;
}

const ExerciseEditForm: React.FC<ExerciseEditFormProps> = ({
  selectedType,
  onTypeChange
}) => {
  const exerciseTypes: ExerciseType[] = [
    'Musculação',
    'Calistenia',
    'Cardio',
    'Esportes',
    'Flexibilidade & Mobilidade'
  ];

  return (
    <div className="mt-2 border-t border-divider pt-4 px-4 pb-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-1">
            Tipo de Exercício
          </label>
          <Select value={selectedType} onValueChange={(value) => onTypeChange(value as ExerciseType)}>
            <SelectTrigger className="w-full bg-midnight-elevated">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {exerciseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ExerciseEditForm;
