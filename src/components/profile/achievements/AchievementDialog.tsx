
import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import AchievementProgress from './AchievementProgress';

interface Achievement {
  id: string;
  icon: React.ReactNode;
  name: string;
  isLocked?: boolean;
  description?: string;
  xpReward?: number;
  date?: string;
  progress?: {
    current: number;
    total: number;
  };
}

interface AchievementDialogProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

const AchievementDialog: React.FC<AchievementDialogProps> = ({ 
  achievement, 
  isOpen, 
  onClose 
}) => {
  if (!achievement) return null;
  
  // Get achievement description for locked achievements
  const getLockedDescription = (id: string) => {
    const descriptionMap: Record<string, string> = {
      'streak': 'Complete 7 dias consecutivos de treino',
      'workouts': 'Complete 100 treinos',
      'locked': 'Complete objetivos para desbloquear'
    };
    
    return descriptionMap[id] || 'Complete objetivos para desbloquear';
  };
  
  // Get icon container style based on achievement status and type
  const getIconContainerStyle = () => {
    if (achievement.isLocked) {
      return 'bg-midnight-elevated border border-divider/30';
    } else if (achievement.id === 'streak') {
      return 'bg-gradient-to-br from-valor to-achievement border border-valor-30 shadow-glow-gold';
    } else {
      return 'bg-gradient-to-br from-arcane to-arcane-60 border border-arcane-30 shadow-glow-purple';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-midnight-card border-arcane-30">
        <DialogHeader>
          <DialogTitle className="orbitron-text">
            {achievement.isLocked ? 'Conquista Bloqueada' : 'Conquista Desbloqueada'}
          </DialogTitle>
          <DialogDescription>
            {achievement.isLocked 
              ? 'Continue sua jornada para desbloquear esta conquista'
              : 'Parabéns por esta conquista em sua jornada fitness!'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center p-4">
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 relative ${getIconContainerStyle()}`}
          >
            {/* Progress circle for locked achievements */}
            {achievement.isLocked && achievement.progress && (
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
                  strokeDasharray={`${(achievement.progress.current / achievement.progress.total) * 226} 226`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="40"
                  cy="40"
                />
              </svg>
            )}
            
            {achievement.icon}
          </div>
          
          <h3 className="text-lg font-bold font-sora mb-2">{achievement.name}</h3>
          
          <p className="text-text-secondary text-sm mb-4">
            {achievement.isLocked 
              ? getLockedDescription(achievement.id) 
              : (achievement.description || 'Você alcançou um marco importante em sua jornada!')}
          </p>
          
          {!achievement.isLocked && (
            <div className="bg-arcane-15 w-full py-2 px-3 rounded-lg mb-4 border border-arcane-30">
              <div className="flex justify-between items-center">
                <span className="text-sm font-sora text-text-secondary">Recompensa</span>
                <span className="text-lg font-bold font-space text-achievement">+25 EXP</span>
              </div>
              <div className="text-right text-xs text-text-tertiary font-sora">Ganho em 10/04/2025</div>
            </div>
          )}
          
          {achievement.isLocked && achievement.progress && (
            <AchievementProgress 
              progress={achievement.progress} 
              id={achievement.id}
            />
          )}
          
          <div className="text-sm text-center text-text-tertiary italic font-sora">
            {achievement.isLocked 
              ? "Você está no caminho dos heróis. Continue assim!"
              : "Uma jornada lendária leva tempo. Parabéns por mais um passo!"}
          </div>
        </div>
        
        <DialogClose className="absolute top-2 right-2 rounded-full p-1">
          <X className="h-4 w-4" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementDialog;
