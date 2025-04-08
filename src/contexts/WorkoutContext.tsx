
import React, { createContext, useContext, ReactNode } from 'react';
import { WorkoutExercise } from '@/types/workout';

interface WorkoutContextProps {
  isLoading: boolean;
  loadError: string | null;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  totalExercises: number;
  updateSet: (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => Promise<WorkoutExercise[] | null>;
  addSet: (exerciseIndex: number) => Promise<WorkoutExercise[] | null>;
  removeSet: (exerciseIndex: number, setIndex: number) => Promise<WorkoutExercise[] | null>;
  finishWorkout: () => Promise<boolean>;
  discardWorkout: () => Promise<boolean>;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  restTimerSettings: { minutes: number, seconds: number };
  handleRestTimerChange: (minutes: number, seconds: number) => void;
  isSubmitting: boolean;
  isTimerSaving: boolean;
  notes: Record<string, string>;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isLocalSubmitting: boolean;
}

const WorkoutContext = createContext<WorkoutContextProps | undefined>(undefined);

export const useWorkoutContext = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkoutContext must be used within a WorkoutProvider');
  }
  return context;
};

interface WorkoutProviderProps {
  children: ReactNode;
  value: WorkoutContextProps;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
