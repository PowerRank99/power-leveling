
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getTimeAgo } from '@/utils/formatters';

interface RoutineCardProps {
  id: string;
  name: string;
  exercisesCount: number;
  lastUsedAt?: string | null;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ 
  id, 
  name, 
  exercisesCount, 
  lastUsedAt,
  onDelete,
  isDeleting = false
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
      <h3 className="font-bold text-lg">{name}</h3>
      <div className="flex text-gray-500 text-sm mt-1 mb-2">
        <span>{exercisesCount} exercícios</span>
        <span className="mx-2">•</span>
        <span>Última vez: {getTimeAgo(lastUsedAt)}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="bg-fitblue-50 text-fitblue-600 font-medium px-3 py-1 rounded-full text-sm">
          {exercisesCount} exercícios
        </span>
        
        <button 
          onClick={() => navigate(`/treino/ativo/${id}`)}
          className="bg-fitblue text-white rounded-lg px-4 py-2 font-medium flex items-center"
          disabled={isDeleting}
        >
          <Play className="w-4 h-4 mr-1" />
          Iniciar Rotina
        </button>
      </div>
    </div>
  );
};

export default RoutineCard;
