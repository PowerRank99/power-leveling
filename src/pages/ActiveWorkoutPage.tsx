
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import { Menu, Edit2 } from 'lucide-react';
import { EditIcon } from '@/components/icons/NavIcons';

const ActiveWorkoutPage = () => {
  const navigate = useNavigate();
  
  const [exercises, setExercises] = useState([
    { id: "1", name: "Supino Reto" },
    { id: "2", name: "Supino Inclinado" }
  ]);
  
  const [currentExercise, setCurrentExercise] = useState(0);
  
  const handleAddSet = () => {
    // Logic to add set to current exercise
    console.log("Adding set to", exercises[currentExercise].name);
  };
  
  const handleCompleteSet = (setIndex: number) => {
    console.log("Completed set", setIndex, "for", exercises[currentExercise].name);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Treino Atual" 
        rightContent={
          <button className="p-1">
            <Menu className="w-6 h-6" />
          </button>
        }
      />
      
      <ActiveWorkout 
        exerciseName={exercises[currentExercise].name}
        onAddSet={handleAddSet}
        onCompleteSet={handleCompleteSet}
      />
      
      {/* Next Exercise Preview */}
      {currentExercise < exercises.length - 1 && (
        <div className="bg-white p-4 border-t border-gray-200 mt-4">
          <p className="text-gray-500 mb-2">Próximo Exercício</p>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{exercises[currentExercise + 1].name}</h3>
              <p className="text-sm text-gray-500">{currentExercise + 2}/{exercises.length}</p>
            </div>
            
            <button className="text-fitblue font-medium">Pular</button>
          </div>
        </div>
      )}
      
      {/* Exercise Notes */}
      <div className="p-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Anotações</h3>
            <EditIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <textarea 
            placeholder="Adicionar notas sobre o exercício..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[100px]"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkoutPage;
