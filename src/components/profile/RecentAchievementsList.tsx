import React, { useState, useEffect } from 'react';
import { ChevronRight, X, Flame, Dumbbell, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import Trophy from '@/components/icons/Trophy';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementStore } from '@/stores/achievementStore';
import { RankService } from '@/services/rpg/RankService';
import { Achievement as AchievementType } from '@/services/rpg/AchievementService';
import { getIconComponent } from '@/components/achievements/AchievementIcon';

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

const RecentAchievementsList: React.FC = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const { user } = useAuth();
  const { rankData, fetchRankData, achievements, fetchAchievements } = useAchievementStore();
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      fetchRankData(user.id);
      fetchAchievements(user.id);
    }
  }, [user?.id, fetchRankData, fetchAchievements]);
  
  useEffect(() => {
    if (achievements.length > 0) {
      const unlocked = achievements.filter(a => a.unlocked).slice(0, 2);
      const locked = achievements.filter(a => !a.unlocked).slice(0, 1);
      
      const formatted = [
        ...unlocked.map(a => ({
          id: a.id,
          icon: getIconComponent(a.icon_name),
          name: a.name,
          isLocked: false,
          description: a.description,
          xpReward: a.xp_reward,
          date: '10/04/2025'
        })),
        ...locked.map(a => ({
          id: a.id,
          icon: getIconComponent(a.icon_name),
          name: a.name,
          isLocked: true,
          description: a.description,
          progress: a.progress || { current: 0, total: 1 }
        }))
      ];
      
      setRecentAchievements(formatted);
    }
  }, [achievements]);
  
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };
  
  const closeModal = () => {
    setSelectedAchievement(null);
  };
  
  if (recentAchievements.length === 0) {
    return null;
  }
  
  return (
    <>
      <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300">
        <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-card bg-opacity-50 backdrop-blur-sm border-b border-divider/30">
          <div className="flex items-center">
            <h3 className="section-header text-lg orbitron-text font-bold text-text-primary mr-2">
              Conquistas
            </h3>
            
            {rankData && (
              <Badge 
                className={`${RankService.getRankBackgroundClass(rankData.rank)} text-text-primary shadow-subtle`}
              >
                <Shield className="w-3 h-3 mr-1" />
                <span className="text-xs font-orbitron">Rank {rankData.rank}</span>
              </Badge>
            )}
          </div>
          
          <Link to="/conquistas" className="text-arcane flex items-center text-sm font-sora hover:text-arcane-60 transition-colors">
            Ver Todas <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="flex justify-between gap-2">
            {recentAchievements.map((achievement) => (
              <TooltipProvider key={achievement.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleAchievementClick(achievement)}
                      className={`flex flex-col items-center justify-center rounded-full w-20 h-20 achievement-circle relative
                        ${
                          achievement.isLocked 
                            ? 'bg-midnight-elevated text-inactive border border-divider/30 hover:border-text-tertiary' 
                            : 'bg-gradient-to-br from-arcane to-arcane-60 text-text-primary border border-arcane-30 hover:shadow-glow-purple'
                        } shadow-subtle transform transition-all duration-300 hover:scale-105 hover:shadow-glow-purple cursor-pointer
                        ${achievement.isLocked ? '' : 'animate-pulse-subtle'}
                      `}
                    >
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
                      
                      <div className="flex items-center justify-center z-10">
                        {achievement.icon}
                      </div>
                      <span className="text-xs text-center mt-1 font-medium font-sora px-1 z-10">{achievement.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {achievement.isLocked && achievement.progress
                      ? (
                        <div>
                          <p className="text-xs">{achievement.description}</p>
                          <p className="text-xs font-space mt-1">
                            Progresso: {achievement.progress.current}/{achievement.progress.total}
                          </p>
                        </div>
                      )
                      : <p className="text-xs">+{achievement.xpReward} EXP ganho em {achievement.date}</p>
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          {rankData && rankData.nextRank && (
            <div className="mt-4 bg-midnight-elevated rounded-md p-3 border border-divider/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary font-sora">Próximo Rank</span>
                <span className={`font-orbitron font-bold ${RankService.getRankColorClass(rankData.nextRank)}`}>
                  {rankData.nextRank}
                </span>
              </div>
              
              <div className="mt-2">
                <div className="h-2 w-full bg-divider rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${RankService.getRankBackgroundClass(rankData.nextRank)}`}
                    style={{ 
                      width: rankData.pointsToNextRank 
                        ? `${100 - Math.min(100, (rankData.pointsToNextRank / (rankData.nextRank === 'E' ? 20 : 30)) * 100)}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between mt-1 text-xs text-text-tertiary">
                  <span>{rankData.rank}</span>
                  <span>
                    {rankData.pointsToNextRank 
                      ? `Faltam ${rankData.pointsToNextRank} pontos` 
                      : 'Rank máximo atingido'
                    }
                  </span>
                  <span>{rankData.nextRank}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                    : 'bg-gradient-to-br from-arcane to-arcane-60 border border-arcane-30 shadow-glow-purple'
                }
              `}
            >
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
              {selectedAchievement?.description || 'Você alcançou um marco importante em sua jornada!'}
            </p>
            
            {!selectedAchievement?.isLocked && (
              <div className="bg-arcane-15 w-full py-2 px-3 rounded-lg mb-4 border border-arcane-30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sora text-text-secondary">Recompensa</span>
                  <span className="text-lg font-bold font-space text-achievement">+{selectedAchievement?.xpReward} EXP</span>
                </div>
                <div className="text-right text-xs text-text-tertiary font-sora">{selectedAchievement?.date}</div>
              </div>
            )}
            
            {selectedAchievement?.isLocked && selectedAchievement?.progress && (
              <div className="bg-midnight-elevated w-full py-2 px-3 rounded-lg mb-4 border border-divider/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sora text-text-tertiary">Progresso</span>
                  <span className="text-sm font-space text-text-secondary">
                    {`${selectedAchievement.progress.current}/${selectedAchievement.progress.total}`}
                  </span>
                </div>
                
                <div className="w-full h-2 bg-divider rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-text-tertiary rounded-full"
                    style={{
                      width: `${(selectedAchievement.progress.current / selectedAchievement.progress.total) * 100}%`
                    }}
                  ></div>
                </div>
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
