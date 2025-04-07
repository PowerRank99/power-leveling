
import React, { useState } from 'react';
import { Clock, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkoutExercise } from '@/hooks/useWorkout';
import RestTimer from '@/components/workout/RestTimer';

interface ActiveWorkoutProps {
  exerciseName: string;
  sets: Array<{
    id: string;
    weight: string;
    reps: string;
    completed: boolean;
    previous?: {
      weight: string;
      reps: string;
    };
  }>;
  onAddSet: () => void;
  onCompleteSet: (index: number) => void;
  onUpdateSet: (index: number, data: { weight?: string; reps?: string }) => void;
  elapsedTime: string;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ 
  exerciseName,
  sets,
  onAddSet,
  onCompleteSet,
  onUpdateSet,
  elapsedTime
}) => {
  const [showRestTimer, setShowRestTimer] = useState(false);
  
  const handleWeightChange = (index: number, value: string) => {
    onUpdateSet(index, { weight: value });
  };

  const handleRepsChange = (index: number, value: string) => {
    onUpdateSet(index, { reps: value });
  };

  const toggleSetCompletion = (index: number) => {
    onCompleteSet(index);
    // Show rest timer when completing a set
    setShowRestTimer(true);
  };

  const handleRestComplete = () => {
    // Hide timer when rest is complete
    setShowRestTimer(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <p className="text-gray-500">Tempo de Treino</p>
          <p className="text-2xl font-bold">{elapsedTime}</p>
        </div>
        
        {showRestTimer ? (
          <div className="flex-1 ml-4">
            <RestTimer onComplete={handleRestComplete} />
          </div>
        ) : (
          <Button
            variant="outline"
            className="bg-fitblue-100 text-fitblue border-none hover:bg-fitblue-200"
            onClick={() => setShowRestTimer(true)}
          >
            <Clock className="text-fitblue mr-2 h-4 w-4" />
            Iniciar Descanso
          </Button>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">{exerciseName}</h2>

        <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-500">
          <div className="col-span-1">SET</div>
          <div className="col-span-3">ANTERIOR</div>
          <div className="col-span-3">KG</div>
          <div className="col-span-3">REPS</div>
          <div className="col-span-2"></div>
        </div>

        {sets.map((set, index) => (
          <div key={set.id} className="grid grid-cols-12 gap-2 mb-4 items-center">
            <div className="col-span-1 font-medium">{index + 1}</div>
            <div className="col-span-3 text-gray-500 text-sm">
              {set.previous ? `${set.previous.weight}kg x ${set.previous.reps}` : '-'}
            </div>
            <div className="col-span-3">
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 text-center"
                value={set.weight}
                onChange={(e) => handleWeightChange(index, e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 text-center"
                value={set.reps}
                onChange={(e) => handleRepsChange(index, e.target.value)}
              />
            </div>
            <div className="col-span-2 flex justify-center">
              <button
                onClick={() => toggleSetCompletion(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  set.completed 
                    ? 'bg-fitgreen text-white' 
                    : 'border border-gray-300'
                }`}
              >
                {set.completed && <Check className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ))}

        <button 
          className="flex items-center justify-center w-full py-2 text-gray-500 font-medium"
          onClick={onAddSet}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Set
        </button>
      </div>
    </div>
  );
};

export default ActiveWorkout;
