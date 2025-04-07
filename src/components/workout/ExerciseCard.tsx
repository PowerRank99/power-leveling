
import React from 'react';
import { ChevronRight, Edit2 } from 'lucide-react';
import { EditIcon } from '../icons/NavIcons';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  name: string;
  category: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  type: 'Composto' | 'Isolado';
  image: string;
  onClick?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  name, 
  category, 
  level, 
  type, 
  image,
  onClick 
}) => {
  const getLevelColor = () => {
    switch(level) {
      case 'Iniciante': return 'bg-fitgreen-100 text-fitgreen-700';
      case 'Intermediário': return 'bg-fitblue-100 text-fitblue-700';
      case 'Avançado': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg overflow-hidden mb-3 bg-white shadow-sm card-hover"
      onClick={onClick}
    >
      <div className="flex items-center p-3">
        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-grow">
          <h3 className="font-bold text-lg mb-1">{name}</h3>
          <p className="text-gray-600 text-sm">{category}</p>
          
          <div className="flex mt-2 space-x-2">
            <span className={cn("text-xs px-2 py-1 rounded-full", getLevelColor())}>
              {level}
            </span>
            <span className="bg-fitblue-100 text-fitblue-700 text-xs px-2 py-1 rounded-full">
              {type}
            </span>
          </div>
        </div>
        
        <ChevronRight className="text-gray-400" />
      </div>
    </div>
  );
};

export default ExerciseCard;
