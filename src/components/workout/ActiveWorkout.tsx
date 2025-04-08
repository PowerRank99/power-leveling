
import React, { useState } from 'react';
import { Clock, Plus, Check, Minus } from 'lucide-react';
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

  const adjustWeight = (index: number, change: number) => {
    const currentWeight = parseFloat(sets[index].weight) || 0;
    const newWeight = Math.max(0, currentWeight + change).toString();
    handleWeightChange(index, newWeight);
  };

  const adjustReps = (index: number, change: number) => {
    const currentReps = parseInt(sets[index].reps) || 0;
    const newReps = Math.max(0, currentReps + change).toString();
    handleRepsChange(index, newReps);
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{exerciseName}</h2>
        </div>
        <div className="flex items-center text-gray-500">
          <Clock className="mr-1 h-4 w-4" />
          <span>{elapsedTime}</span>
        </div>
      </div>

      {showRestTimer ? (
        <div className="mb-6">
          <RestTimer onComplete={handleRestComplete} />
        </div>
      ) : (
        <button
          className="w-full py-3 mb-6 text-fitblue font-medium border border-fitblue rounded-md flex items-center justify-center"
          onClick={() => setShowRestTimer(true)}
        >
          <Clock className="mr-2 h-5 w-5" />
          Iniciar Descanso
        </button>
      )}

      <div className="mb-6">
        <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-gray-500 px-2">
          <div className="col-span-1">SET</div>
          <div className="col-span-3">ANTERIOR</div>
          <div className="col-span-3">KG</div>
          <div className="col-span-3">REPS</div>
          <div className="col-span-2 text-center">✓</div>
        </div>

        {sets.map((set, index) => (
          <div key={set.id} className="mb-4 bg-white rounded-lg shadow-sm p-2">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1 font-medium text-center">{index + 1}</div>
              <div className="col-span-3 text-gray-500 text-xs">
                {set.previous ? `${set.previous.weight}kg × ${set.previous.reps}` : '-'}
              </div>
              
              {/* Weight section with +/- buttons */}
              <div className="col-span-3 flex items-center">
                <button 
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                  onClick={() => adjustWeight(index, -2.5)}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="text"
                  className="w-full mx-1 border border-gray-200 rounded p-2 text-center text-sm"
                  value={set.weight}
                  onChange={(e) => handleWeightChange(index, e.target.value)}
                />
                <button 
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                  onClick={() => adjustWeight(index, 2.5)}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              {/* Reps section with +/- buttons */}
              <div className="col-span-3 flex items-center">
                <button 
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                  onClick={() => adjustReps(index, -1)}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="text"
                  className="w-full mx-1 border border-gray-200 rounded p-2 text-center text-sm"
                  value={set.reps}
                  onChange={(e) => handleRepsChange(index, e.target.value)}
                />
                <button 
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                  onClick={() => adjustReps(index, 1)}
                >
                  <Plus className="w-3 h-3" />
                </button>
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
          </div>
        ))}

        <button 
          className="flex items-center justify-center w-full py-3 mt-4 border border-gray-200 rounded-md text-gray-600 font-medium"
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
