
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  muscle_group?: string;
}

interface TestingExerciseSelectorProps {
  selectedExerciseId: string;
  onSelect: (id: string) => void;
  label?: string;
  disabled?: boolean;
}

const TestingExerciseSelector: React.FC<TestingExerciseSelectorProps> = ({
  selectedExerciseId,
  onSelect,
  label = "Select Exercise",
  disabled = false
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, muscle_group')
        .order('name')
        .limit(100);
      
      if (error) throw error;
      
      setExercises(data || []);
      // Select first exercise if none selected and data is available
      if (!selectedExerciseId && data && data.length > 0) {
        onSelect(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Error fetching exercises');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="exerciseSelect">{label}</Label>
      <Select 
        value={selectedExerciseId} 
        onValueChange={onSelect}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="exerciseSelect" className="bg-midnight-elevated border-divider">
          <SelectValue placeholder={isLoading ? "Loading exercises..." : "Select an exercise"} />
        </SelectTrigger>
        <SelectContent className="bg-midnight-elevated border-divider max-h-[300px]">
          {exercises.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.id}>
              {exercise.name} {exercise.muscle_group ? `(${exercise.muscle_group})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TestingExerciseSelector;
