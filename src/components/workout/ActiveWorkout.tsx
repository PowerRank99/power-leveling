
import React, { useState } from 'react';
import { Clock, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActiveWorkoutProps {
  exerciseName: string;
  onAddSet: () => void;
  onCompleteSet: (index: number) => void;
}

interface Set {
  weight: string;
  reps: string;
  completed: boolean;
  previous?: {
    weight: string;
    reps: string;
  };
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ 
  exerciseName,
  onAddSet,
  onCompleteSet
}) => {
  const [sets, setSets] = useState<Set[]>([
    { weight: '60', reps: '12', completed: false, previous: { weight: '60', reps: '12' } },
    { weight: '60', reps: '12', completed: false, previous: { weight: '60', reps: '12' } },
    { weight: '60', reps: '12', completed: false, previous: { weight: '60', reps: '12' } },
  ]);
  
  const [notes, setNotes] = useState("");
  const [timer, setTimer] = useState("32:15");

  const handleWeightChange = (index: number, value: string) => {
    const newSets = [...sets];
    newSets[index].weight = value;
    setSets(newSets);
  };

  const handleRepsChange = (index: number, value: string) => {
    const newSets = [...sets];
    newSets[index].reps = value;
    setSets(newSets);
  };

  const toggleSetCompletion = (index: number) => {
    const newSets = [...sets];
    newSets[index].completed = !newSets[index].completed;
    setSets(newSets);
    if (newSets[index].completed) {
      onCompleteSet(index);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <p className="text-gray-500">Tempo de Treino</p>
          <p className="text-2xl font-bold">{timer}</p>
        </div>
        <div className="bg-fitblue-100 rounded-lg p-3 flex items-center">
          <Clock className="text-fitblue mr-2" />
          <span className="text-fitblue font-medium">01:30</span>
        </div>
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
          <div key={index} className="grid grid-cols-12 gap-2 mb-4 items-center">
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

      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">Anotações</h3>
        <textarea 
          className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
          placeholder="Adicionar notas sobre o exercício..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ActiveWorkout;
