
import React from 'react';
import { ExerciseType, DifficultyLevel } from '@/components/workout/types/Exercise';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExerciseEditFormProps {
  selectedType: ExerciseType;
  selectedLevel: DifficultyLevel;
  onTypeChange: (type: ExerciseType) => void;
  onLevelChange: (level: DifficultyLevel) => void;
}

const ExerciseEditForm: React.FC<ExerciseEditFormProps> = ({
  selectedType,
  selectedLevel,
  onTypeChange,
  onLevelChange
}) => {
  const exerciseTypes: ExerciseType[] = [
    'Musculação',
    'Calistenia',
    'Cardio',
    'Esportes',
    'Flexibilidade & Mobilidade'
  ];

  const difficultyLevels: DifficultyLevel[] = [
    'Iniciante',
    'Intermediário',
    'Avançado'
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
        
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-text-secondary mb-1">
            Nível de Dificuldade
          </label>
          <Select value={selectedLevel} onValueChange={(value) => onLevelChange(value as DifficultyLevel)}>
            <SelectTrigger className="w-full bg-midnight-elevated">
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
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
