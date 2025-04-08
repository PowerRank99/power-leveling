
import React, { useState } from 'react';
import { Clock, Plus, Check, MoreVertical } from 'lucide-react';
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
  exerciseIndex: number;
  onAddSet: () => void;
  onCompleteSet: (index: number) => void;
  onUpdateSet: (index: number, data: { weight?: string; reps?: string }) => void;
  exerciseId: string;
  notes: string;
  onNotesChange: (value: string) => void;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ 
  exerciseName,
  sets,
  onAddSet,
  onCompleteSet,
  onUpdateSet,
  notes,
  onNotesChange
}) => {
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimeMinutes, setRestTimeMinutes] = useState(1);
  const [restTimeSeconds, setRestTimeSeconds] = useState(30);
  
  const handleWeightChange = (index: number, value: string) => {
    onUpdateSet(index, { weight: value });
  };

  const handleRepsChange = (index: number, value: string) => {
    onUpdateSet(index, { reps: value });
  };

  const handleSetCompletion = (index: number) => {
    onCompleteSet(index);
    // Show rest timer when completing a set
    setShowRestTimer(true);
  };

  const handleRestComplete = () => {
    // Hide timer when rest is complete
    setShowRestTimer(false);
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center">
            <img 
              src="/placeholder.svg" 
              alt={exerciseName} 
              className="w-8 h-8 object-contain"
            />
          </div>
          <h2 className="text-xl font-bold">{exerciseName}</h2>
        </div>
        <button className="p-2">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Add notes here..."
          className="w-full px-0 py-2 text-gray-500 border-0 border-b border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-300 bg-transparent"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>

      {showRestTimer ? (
        <div className="mb-6">
          <RestTimer 
            minutes={restTimeMinutes} 
            seconds={restTimeSeconds} 
            onComplete={handleRestComplete} 
            onTimerChange={(min, sec) => {
              setRestTimeMinutes(min);
              setRestTimeSeconds(sec);
            }}
          />
        </div>
      ) : (
        <button
          className="w-full flex items-center text-blue-500 py-3 mb-4"
          onClick={() => setShowRestTimer(true)}
        >
          <Clock className="mr-2 h-5 w-5" />
          Rest Timer: {restTimeMinutes}min {restTimeSeconds}s
        </button>
      )}

      <div className="mb-6">
        <div className="grid grid-cols-12 gap-2 mb-3 text-sm font-medium text-gray-500">
          <div className="col-span-1">SET</div>
          <div className="col-span-4">PREVIOUS</div>
          <div className="col-span-3 text-center">KG</div>
          <div className="col-span-3 text-center">REPS</div>
          <div className="col-span-1 text-center">✓</div>
        </div>

        {sets.map((set, index) => {
          const isCompleted = set.completed;
          const rowClass = isCompleted ? "bg-gray-50" : "bg-white";
          
          return (
            <div key={set.id} className={`grid grid-cols-12 gap-2 items-center py-4 ${rowClass} border-b border-gray-100`}>
              <div className="col-span-1 font-bold text-gray-800">{index + 1}</div>
              <div className="col-span-4 text-gray-500 text-sm">
                {set.previous ? `${set.previous.weight}kg × ${set.previous.reps}` : '-'}
              </div>
              
              <div className="col-span-3">
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded p-2 text-center"
                  value={set.weight}
                  onChange={(e) => handleWeightChange(index, e.target.value)}
                />
              </div>
              
              <div className="col-span-3">
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded p-2 text-center"
                  value={set.reps}
                  onChange={(e) => handleRepsChange(index, e.target.value)}
                />
              </div>
              
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => handleSetCompletion(index)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-100 text-green-500'
                      : 'border border-gray-300 bg-white'
                  }`}
                >
                  {isCompleted && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}

        <button 
          className="flex items-center justify-center w-full py-4 mt-4 bg-gray-100 rounded-md text-gray-700 font-medium"
          onClick={onAddSet}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Set
        </button>
      </div>
    </div>
  );
};

export default ActiveWorkout;
