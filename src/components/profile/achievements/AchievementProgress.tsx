
import React from 'react';

interface AchievementProgressProps {
  progress: {
    current: number;
    total: number;
  };
  id: string;
}

const AchievementProgress: React.FC<AchievementProgressProps> = ({ progress, id }) => {
  return (
    <div className="bg-midnight-elevated w-full py-2 px-3 rounded-lg mb-4 border border-divider/30">
      <div className="flex justify-between items-center">
        <span className="text-sm font-sora text-text-tertiary">Progresso</span>
        <span className="text-sm font-space text-text-secondary">
          {id === 'workouts' 
            ? `${progress.current}/${progress.total} treinos` 
            : id === 'streak' 
              ? `${progress.current}/${progress.total} dias` 
              : `${Math.round((progress.current / progress.total) * 100)}%`}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-divider rounded-full mt-2 overflow-hidden">
        <div 
          className="h-full bg-text-tertiary rounded-full"
          style={{
            width: `${(progress.current / progress.total) * 100}%`
          }}
        ></div>
      </div>
      
      {/* Next tier */}
      {id === 'streak' && progress.current >= 3 && (
        <div className="mt-2 text-xs text-valor">
          Próximo marco: 7 dias (Streak Lendário)
        </div>
      )}
    </div>
  );
};

export default AchievementProgress;
