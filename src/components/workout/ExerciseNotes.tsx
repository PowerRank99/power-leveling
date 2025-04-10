
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
        placeholder="Adicionar notas aqui..."
        className="w-full px-0 py-2 text-text-secondary border-0 border-b border-divider focus:outline-none focus:ring-0 focus:border-arcane-30 bg-transparent font-sora placeholder:text-text-tertiary"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ExerciseNotes;
