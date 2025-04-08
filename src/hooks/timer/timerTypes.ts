
import { WorkoutExercise } from '@/types/workoutTypes';

export interface TimerState {
  exerciseId: string | null;
  exerciseName: string | null;
  isActive: boolean;
  isPaused: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  progress: number;
}

export interface TimerSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationEnabled: boolean;
}

export interface UseExerciseRestTimerProps {
  onFinish?: () => void;
}

export interface UseExerciseRestTimerReturn {
  timerState: TimerState;
  timerSettings: TimerSettings;
  showDurationSelector: boolean;
  setShowDurationSelector: (show: boolean) => void;
  startTimer: (exerciseId: string, exerciseName: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
  formatTime: (seconds: number) => string;
  loadExerciseTimerDuration: (exerciseId: string) => Promise<number | null>;
  updateTimerDuration: (exerciseId: string, duration: number) => void;
  saveTimerSettings: (settings: Partial<TimerSettings>) => Promise<void>;
  saveDefaultTimerDuration: (duration: number) => Promise<void>;
}
