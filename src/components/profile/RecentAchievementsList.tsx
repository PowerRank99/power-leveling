
import React, { useState } from 'react';
import { ChevronRight, X, Flame, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Trophy from '@/components/icons/Trophy';

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

interface RecentAchievementsListProps {
  achievements: Achievement[];
}

const RecentAchievementsList: React.FC<RecentAchievementsListProps> = ({ achievements }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };
  
  const closeModal = () => {
    setSelectedAchievement(null);
  };
  
  // Get achievement description for locked achievements
  const getLockedDescription = (id: string) => {
    const descriptionMap: Record<string, string> = {
      'streak': 'Complete 7 dias consecutivos de treino',
      'workouts': 'Complete 100 treinos',
      'locked': 'Complete objetivos para desbloquear'
    };
    
    return descriptionMap[id] || 'Complete objetivos para desbloquear';
  };
  
  // Get achievement progress data
  const getAchievementProgress = (id: string) => {
    const progressMap: Record<string, { current: number, total: number }> = {
      'streak': { current: 2, total: 7 },
      'workouts': { current: 50, total: 100 },
      'locked': { current: 0, total: 1 }
    };
    
    return progressMap[id] || { current: 0, total: 1 };
  };
  
  return (
    <>
      <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300">
        <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-card bg-opacity-50 backdrop-blur-sm border-b border-divider/30">
          <h3 className="section-header text-lg orbitron-text font-bold text-text-primary">
            Conquistas Recentes
          </h3>
          <Link to="/conquistas" className="text-arcane flex items-center text-sm font-sora hover:text-arcane-60 transition-colors">
            Ver Todas as Conquistas 🏅 <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="flex justify-between gap-2">
            {achievements.map((achievement) => (
              <TooltipProvider key={achievement.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleAchievementClick({
                        ...achievement,
                        progress: achievement.isLocked ? getAchievementProgress(achievement.id) : undefined
                      })}
                      className={`flex flex-col items-center justify-center rounded-full w-20 h-20 achievement-circle relative
                        ${
                          achievement.isLocked 
                            ? 'bg-midnight-elevated text-inactive border border-divider/30 hover:border-text-tertiary' 
                            : achievement.id === 'streak' 
                              ? 'bg-gradient-to-br from-valor to-achievement text-text-primary border border-valor-30 hover:shadow-glow-gold' 
                              : achievement.id === 'workouts' 
                                ? 'bg-gradient-to-br from-arcane to-arcane-60 text-text-primary border border-arcane-30 hover:shadow-glow-purple' 
                                : 'bg-gradient-to-br from-arcane to-valor text-text-primary border border-arcane-30 hover:shadow-glow-purple'
                        } shadow-subtle transform transition-all duration-300 hover:scale-105 hover:shadow-glow-purple cursor-pointer
                        ${achievement.isLocked ? '' : 'animate-pulse-subtle'}
                      `}
                    >
                      {/* Progress circle for locked achievements */}
                      {achievement.isLocked && (
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
                            strokeDasharray={`${(getAchievementProgress(achievement.id).current / getAchievementProgress(achievement.id).total) * 226} 226`}
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
                        {achievement.icon}
                      </div>
                      <span className="text-xs text-center mt-1 font-medium font-sora px-1 z-10">{achievement.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {achievement.isLocked 
                      ? (
                        <div>
                          <p className="text-xs">{getLockedDescription(achievement.id)}</p>
                          <p className="text-xs font-space mt-1">
                            Progresso: {getAchievementProgress(achievement.id).current}/{getAchievementProgress(achievement.id).total}
                          </p>
                        </div>
                      )
                      : <p className="text-xs">+25 EXP ganho em 10/04/2025</p>
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Modal */}
      <Dialog open={selectedAchievement !== null} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md bg-midnight-card border-arcane-30">
          <DialogHeader>
            <DialogTitle className="orbitron-text">
              {selectedAchievement?.isLocked ? 'Conquista Bloqueada' : 'Conquista Desbloqueada'}
            </DialogTitle>
            <DialogDescription>
              {selectedAchievement?.isLocked 
                ? 'Continue sua jornada para desbloquear esta conquista'
                : 'Parabéns por esta conquista em sua jornada fitness!'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center p-4">
            <div 
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 relative
                ${
                  selectedAchievement?.isLocked 
                    ? 'bg-midnight-elevated border border-divider/30' 
                    : selectedAchievement?.id === 'streak' 
                      ? 'bg-gradient-to-br from-valor to-achievement border border-valor-30 shadow-glow-gold' 
                      : 'bg-gradient-to-br from-arcane to-arcane-60 border border-arcane-30 shadow-glow-purple'
                }
              `}
            >
              {/* Progress circle for locked achievements */}
              {selectedAchievement?.isLocked && selectedAchievement?.progress && (
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
                    strokeDasharray={`${(selectedAchievement.progress.current / selectedAchievement.progress.total) * 226} 226`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="40"
                    cy="40"
                  />
                </svg>
              )}
              
              {selectedAchievement?.icon}
            </div>
            
            <h3 className="text-lg font-bold font-sora mb-2">{selectedAchievement?.name}</h3>
            
            <p className="text-text-secondary text-sm mb-4">
              {selectedAchievement?.isLocked 
                ? getLockedDescription(selectedAchievement?.id || '') 
                : (selectedAchievement?.description || 'Você alcançou um marco importante em sua jornada!')}
            </p>
            
            {!selectedAchievement?.isLocked && (
              <div className="bg-arcane-15 w-full py-2 px-3 rounded-lg mb-4 border border-arcane-30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sora text-text-secondary">Recompensa</span>
                  <span className="text-lg font-bold font-space text-achievement">+25 EXP</span>
                </div>
                <div className="text-right text-xs text-text-tertiary font-sora">Ganho em 10/04/2025</div>
              </div>
            )}
            
            {selectedAchievement?.isLocked && selectedAchievement?.progress && (
              <div className="bg-midnight-elevated w-full py-2 px-3 rounded-lg mb-4 border border-divider/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sora text-text-tertiary">Progresso</span>
                  <span className="text-sm font-space text-text-secondary">
                    {selectedAchievement.id === 'workouts' 
                      ? `${selectedAchievement.progress.current}/${selectedAchievement.progress.total} treinos` 
                      : selectedAchievement.id === 'streak' 
                        ? `${selectedAchievement.progress.current}/${selectedAchievement.progress.total} dias` 
                        : `${Math.round((selectedAchievement.progress.current / selectedAchievement.progress.total) * 100)}%`}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-divider rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-text-tertiary rounded-full"
                    style={{
                      width: `${(selectedAchievement.progress.current / selectedAchievement.progress.total) * 100}%`
                    }}
                  ></div>
                </div>
                
                {/* Next tier */}
                {selectedAchievement.id === 'streak' && selectedAchievement.progress.current >= 3 && (
                  <div className="mt-2 text-xs text-valor">
                    Próximo marco: 7 dias (Streak Lendário)
                  </div>
                )}
              </div>
            )}
            
            <div className="text-sm text-center text-text-tertiary italic font-sora">
              {selectedAchievement?.isLocked 
                ? "Você está no caminho dos heróis. Continue assim!"
                : "Uma jornada lendária leva tempo. Parabéns por mais um passo!"}
            </div>
          </div>
          
          <DialogClose className="absolute top-2 right-2 rounded-full p-1">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentAchievementsList;
