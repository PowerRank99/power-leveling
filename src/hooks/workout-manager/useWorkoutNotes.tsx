
import React from 'react';

/**
 * Hook responsible for managing workout notes
 */
export const useWorkoutNotes = (
  setNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  /**
   * Handles updating exercise notes
   */
  const handleNotesChange = (exerciseId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [exerciseId]: value
    }));
  };

  return {
    handleNotesChange
  };
};
