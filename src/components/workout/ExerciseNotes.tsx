
import React from 'react';

interface ExerciseNotesProps {
  notes: string;
  onChange: (value: string) => void;
}

const ExerciseNotes: React.FC<ExerciseNotesProps> = ({ notes, onChange }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Add notes here..."
        className="w-full px-0 py-2 text-gray-500 border-0 border-b border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-300 bg-transparent"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ExerciseNotes;
