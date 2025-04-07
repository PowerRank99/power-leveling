
import React from 'react';
import { EditIcon } from '@/components/icons/NavIcons';

interface ExerciseNotesProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

const ExerciseNotes: React.FC<ExerciseNotesProps> = ({ notes, onNotesChange }) => {
  return (
    <div className="p-4">
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Anotações</h3>
          <EditIcon className="w-5 h-5 text-gray-400" />
        </div>
        
        <textarea 
          placeholder="Adicionar notas sobre o exercício..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[100px]"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
};

export default ExerciseNotes;
