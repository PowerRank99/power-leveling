
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, X, RefreshCw } from 'lucide-react';
import { Exercise, ExerciseType } from '@/components/workout/types/Exercise';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ExerciseCard from '@/components/workout/ExerciseCard';

interface ExerciseEditorProps {
  exercise: Exercise;
  onDelete: (id: string) => void;
  onUpdate: (exercise: Exercise) => void;
}

const ExerciseEditor: React.FC<ExerciseEditorProps> = ({ 
  exercise, 
  onDelete,
  onUpdate 
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState<ExerciseType>(exercise.type);
  const [selectedLevel, setSelectedLevel] = useState<string>(exercise.level);
  const [isUpdating, setIsUpdating] = useState(false);

  const exerciseTypes: ExerciseType[] = [
    'Musculação',
    'Calistenia',
    'Cardio',
    'Esportes',
    'Flexibilidade & Mobilidade'
  ];

  const difficultyLevels = [
    'Iniciante',
    'Intermediário',
    'Avançado'
  ];

  const handleTypeChange = (type: ExerciseType) => {
    setSelectedType(type);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
  };

  const handleCancelEdit = () => {
    setSelectedType(exercise.type);
    setSelectedLevel(exercise.level);
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    // If nothing changed, just close editing mode
    if (selectedType === exercise.type && selectedLevel === exercise.level) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {};
      
      if (selectedType !== exercise.type) {
        updateData.type = selectedType;
      }
      
      if (selectedLevel !== exercise.level) {
        updateData.level = selectedLevel;
      }
      
      const { data, error } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', exercise.id)
        .select('*')
        .single();

      if (error) throw error;
      
      const updatedExercise = {
        ...exercise,
        type: selectedType,
        level: selectedLevel
      };

      onUpdate(updatedExercise);
      
      // Construct a meaningful message about what was updated
      let updateMessage = '';
      if (selectedType !== exercise.type && selectedLevel !== exercise.level) {
        updateMessage = `Tipo alterado para ${selectedType} e nível para ${selectedLevel}`;
      } else if (selectedType !== exercise.type) {
        updateMessage = `Tipo alterado para ${selectedType}`;
      } else {
        updateMessage = `Nível alterado para ${selectedLevel}`;
      }
      
      toast({
        title: 'Exercício atualizado',
        description: updateMessage,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o exercício',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <ExerciseCard
        name={exercise.name}
        category={exercise.muscle_group || 'Não especificado'}
        level={exercise.level as any}
        type={exercise.type}
        image={exercise.image_url || '/placeholder.svg'}
        description={exercise.description}
        equipment={exercise.equipment_type || 'Não especificado'}
        muscleGroup={exercise.muscle_group || 'Não especificado'}
        equipmentType={exercise.equipment_type || 'Não especificado'}
        expanded={isEditing}
      />
      
      {/* Control buttons */}
      <div className="absolute top-3 right-3 flex space-x-2">
        {!isEditing ? (
          <>
            <button 
              className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200"
              onClick={() => setIsEditing(true)}
              aria-label="Editar exercício"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
              onClick={() => onDelete(exercise.id)}
              aria-label="Excluir exercício"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button 
              className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200"
              onClick={handleSaveChanges}
              disabled={isUpdating}
              aria-label="Salvar mudanças"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button 
              className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              aria-label="Cancelar edição"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      
      {/* Edit form */}
      {isEditing && (
        <div className="mt-2 border-t border-divider pt-4 px-4 pb-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-1">
                Tipo de Exercício
              </label>
              <Select value={selectedType} onValueChange={(value) => handleTypeChange(value as ExerciseType)}>
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
              <Select value={selectedLevel} onValueChange={handleLevelChange}>
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
      )}
    </div>
  );
};

export default ExerciseEditor;
