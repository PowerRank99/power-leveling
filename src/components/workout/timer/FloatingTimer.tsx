
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, Clock, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { TimerState } from '@/hooks/timer/timerTypes';

interface FloatingTimerProps {
  timerState: TimerState;
  formatTime: (seconds: number) => string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAddTime: (seconds: number) => void;
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({
  timerState,
  formatTime,
  onPause,
  onResume,
  onStop,
  onAddTime
}) => {
  const prevProgress = useRef<number>(0);
  const timerRef = useRef<HTMLDivElement>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Handle pulse animation on timer tick
  useEffect(() => {
    if (prevProgress.current !== timerState.progress && timerRef.current) {
      // Add a subtle pulse animation when the timer ticks
      timerRef.current.classList.add('pulse');
      const timeout = setTimeout(() => {
        if (timerRef.current) {
          timerRef.current.classList.remove('pulse');
        }
      }, 200);
      
      prevProgress.current = timerState.progress;
      return () => clearTimeout(timeout);
    }
  }, [timerState.progress]);

  // Handle countdown animation for last 3 seconds
  useEffect(() => {
    if (timerState.remainingSeconds <= 3 && timerState.remainingSeconds > 0 && timerState.isActive && !timerState.isPaused) {
      setIsCountingDown(true);
    } else {
      setIsCountingDown(false);
    }
  }, [timerState.remainingSeconds, timerState.isActive, timerState.isPaused]);

  if (!timerState.isActive) return null;

  return (
    <div 
      ref={timerRef}
      className={`fixed bottom-16 left-0 right-0 mx-auto w-11/12 max-w-md bg-white shadow-lg rounded-lg border border-gray-200 transition-all duration-200 z-50 p-3 ${
        isCountingDown ? 'countdown-animation' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-gray-600">
            Tempo de descanso
          </span>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTime(30)}
            title="Adicionar 30s"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            title="Finalizar"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center mb-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={timerState.isPaused ? onResume : onPause}
          title={timerState.isPaused ? "Continuar" : "Pausar"}
          className="h-10 w-10 p-0"
        >
          {timerState.isPaused ? (
            <Play className="w-6 h-6 text-blue-600" />
          ) : (
            <Pause className="w-6 h-6 text-blue-600" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className={`text-xl font-bold text-center mb-1 ${isCountingDown ? 'text-red-500 countdown-text' : ''}`}>
            {formatTime(timerState.remainingSeconds)}
          </div>
          <Slider
            value={[timerState.progress * 100]}
            max={100}
            step={1}
            disabled
            className={`cursor-default ${isCountingDown ? 'countdown-slider' : ''}`}
          />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          title="Avançar para próximo exercício"
          onClick={onStop}
        >
          <ArrowRight className="w-5 h-5 text-blue-600" />
        </Button>
      </div>
      
      {timerState.exerciseName && (
        <div className="text-xs text-center text-gray-500">
          Próximo: {timerState.exerciseName}
        </div>
      )}
    </div>
  );
};

export default FloatingTimer;
