
import React from 'react';
import { Edit2, Trash2, Check, X, RefreshCw } from 'lucide-react';

interface EditorControlsProps {
  isEditing: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditorControls: React.FC<EditorControlsProps> = ({
  isEditing,
  isUpdating,
  onEdit,
  onDelete,
  onSave,
  onCancel
}) => {
  if (!isEditing) {
    return (
      <div className="absolute top-3 right-3 flex space-x-2">
        <button 
          className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200"
          onClick={onEdit}
          aria-label="Editar exercício"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
          onClick={onDelete}
          aria-label="Excluir exercício"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }
  
  return (
    <div className="absolute top-3 right-3 flex space-x-2">
      <button 
        className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200"
        onClick={onSave}
        disabled={isUpdating}
        aria-label="Salvar mudanças"
      >
        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button 
        className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
        onClick={onCancel}
        disabled={isUpdating}
        aria-label="Cancelar edição"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditorControls;
