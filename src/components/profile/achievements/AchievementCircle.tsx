
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AchievementCircleProps {
  id: string;
  icon: React.ReactNode;
  name: string;
  isLocked?: boolean;
  onClick: () => void;
  progress?: {
    current: number;
    total: number;
  };
}

const AchievementCircle: React.FC<AchievementCircleProps> = ({ 
  id, 
  icon, 
  name, 
  isLocked, 
  onClick,
  progress 
}) => {
  // Get achievement description for locked achievements
  const getLockedDescription = (id: string) => {
    const descriptionMap: Record<string, string> = {
      'streak': 'Complete 7 dias consecutivos de treino',
      'workouts': 'Complete 100 treinos',
      'locked': 'Complete objetivos para desbloquear'
    };
    
    return descriptionMap[id] || 'Complete objetivos para desbloquear';
  };
  
  // Get the styling based on achievement type and status
  const getCircleStyle = () => {
    if (isLocked) {
      return 'bg-midnight-elevated text-inactive border border-divider/30 hover:border-text-tertiary';
    } else if (id === 'streak') {
      return 'bg-gradient-to-br from-valor to-achievement text-text-primary border border-valor-30 hover:shadow-glow-gold';
    } else if (id === 'workouts') {
      return 'bg-gradient-to-br from-arcane to-arcane-60 text-text-primary border border-arcane-30 hover:shadow-glow-purple';
    } else {
      return 'bg-gradient-to-br from-arcane to-valor text-text-primary border border-arcane-30 hover:shadow-glow-purple';
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={onClick}
            className={`flex flex-col items-center justify-center rounded-full w-20 h-20 achievement-circle relative
              ${getCircleStyle()} shadow-subtle transform transition-all duration-300 hover:scale-105 hover:shadow-glow-purple cursor-pointer
              ${isLocked ? '' : 'animate-pulse-subtle'}
            `}
          >
            {/* Progress circle for locked achievements */}
            {isLocked && progress && (
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  className="text-divider"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="40"
                  cy="40"
                />
                <circle
                  className="text-text-tertiary transition-all duration-700"
                  strokeWidth="4"
                  strokeDasharray={`${(progress.current / progress.total) * 226} 226`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="40"
                  cy="40"
                />
              </svg>
            )}
            
            <div className="flex items-center justify-center z-10">
              {icon}
            </div>
            <span className="text-xs text-center mt-1 font-medium font-sora px-1 z-10">{name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isLocked 
            ? (
              <div>
                <p className="text-xs">{getLockedDescription(id)}</p>
                {progress && (
                  <p className="text-xs font-space mt-1">
                    Progresso: {progress.current}/{progress.total}
                  </p>
                )}
              </div>
            )
            : <p className="text-xs">+25 EXP ganho em 10/04/2025</p>
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementCircle;
