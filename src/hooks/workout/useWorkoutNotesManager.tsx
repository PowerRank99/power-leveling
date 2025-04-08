
import { useState } from 'react';

/**
 * Hook for managing workout notes
 */
export const useWorkoutNotesManager = () => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  const handleNotesChange = (exerciseId: string, value: string) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [exerciseId]: value
    }));
  };
  
  return {
    notes,
    handleNotesChange
  };
};
