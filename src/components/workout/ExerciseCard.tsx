
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  name: string;
  category: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  type?: 'Composto' | 'Isolado'; // Kept for backward compatibility but not displayed
  image: string;
  description?: string;
  equipment?: string;
  muscleGroup?: string;
  equipmentType?: string;
  onClick?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  name, 
  category, 
  level, 
  type, // Kept for backward compatibility
  image,
  description,
  equipment,
  muscleGroup,
  equipmentType,
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
  
  // Use consistent display values
  const displayMuscleGroup = muscleGroup || category || 'Não especificado';
  const displayEquipment = equipmentType || equipment || 'Não especificado';
  
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
          <p className="text-gray-600 text-sm">{displayMuscleGroup}</p>
          
          <p className="text-gray-500 text-xs mt-1">
            <span className="font-medium">Equipamento:</span> {displayEquipment}
          </p>
          
          <div className="flex mt-2 space-x-2">
            <span className={cn("text-xs px-2 py-1 rounded-full", getLevelColor())}>
              {level}
            </span>
          </div>
        </div>
        
        <ChevronRight className="text-gray-400" />
      </div>
      
      {description && (
        <div className="px-3 pb-3 pt-0 text-sm text-gray-600 border-t border-gray-100 mt-1">
          {description}
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
