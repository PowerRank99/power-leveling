
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Exercise, ExerciseType, DifficultyLevel } from '@/components/workout/types/Exercise';
import ExerciseCard from '@/components/workout/ExerciseCard';
import ExerciseEditForm from './ExerciseEditForm';
import EditorControls from './EditorControls';

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
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(exercise.level);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTypeChange = (type: ExerciseType) => {
    setSelectedType(type);
  };

  const handleLevelChange = (level: DifficultyLevel) => {
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
      
      const updatedExercise: Exercise = {
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
        level={exercise.level}
        type={exercise.type}
        image={exercise.image_url || '/placeholder.svg'}
        description={exercise.description}
        equipment={exercise.equipment_type || 'Não especificado'}
        muscleGroup={exercise.muscle_group || 'Não especificado'}
        equipmentType={exercise.equipment_type || 'Não especificado'}
        expanded={isEditing}
      />
      
      <EditorControls 
        isEditing={isEditing}
        isUpdating={isUpdating}
        onEdit={() => setIsEditing(true)}
        onDelete={() => onDelete(exercise.id)}
        onSave={handleSaveChanges}
        onCancel={handleCancelEdit}
      />
      
      {isEditing && (
        <ExerciseEditForm 
          selectedType={selectedType}
          selectedLevel={selectedLevel}
          onTypeChange={handleTypeChange}
          onLevelChange={handleLevelChange}
        />
      )}
    </div>
  );
};

export default ExerciseEditor;
