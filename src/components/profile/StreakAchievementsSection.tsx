
import React from 'react';
import { Flame, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Trophy from '@/components/icons/Trophy';

interface StreakAchievementsSectionProps {
  streak: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
}

const StreakAchievementsSection: React.FC<StreakAchievementsSectionProps> = ({
  streak,
  achievementsUnlocked,
  achievementsTotal
}) => {
  // Determine if streak is legendary (7+ days)
  const isLegendaryStreak = streak >= 7;
  // Determine if streak is notable (3+ days)
  const isNotableStreak = streak >= 3;
  
  // Calculate streak progress percentage for the progress ring
  const streakProgress = Math.min(streak / 7 * 100, 100);
  
  return (
    <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-1 flex items-center justify-center p-3 border-r border-divider">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <div 
                      className={`p-2 rounded-full mr-3 text-white 
                        ${isLegendaryStreak 
                          ? 'shadow-glow-gold animate-pulse-glow border border-achievement-30' 
                          : 'shadow-glow-purple border border-valor-30'}`}
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(250, 204, 21, 0.85))'
                      }}
                    >
                      <Flame className="w-5 h-5" />
                      
                      {/* Progress ring for streak */}
                      {streak > 1 && (
                        <svg className="absolute -top-1 -left-1 h-10 w-10">
                          <circle
                            className="text-divider"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="transparent"
                            r="15"
                            cx="20"
                            cy="20"
                          />
                          <circle
                            className={`${isLegendaryStreak ? 'text-achievement' : 'text-valor-60'}`}
                            strokeWidth="2"
                            strokeDasharray={`${streakProgress} 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="15"
                            cx="20"
                            cy="20"
                            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">
                    {isLegendaryStreak 
                      ? 'Streak Lendário! +35% EXP' 
                      : streak > 1 
                        ? `+${streak * 5}% EXP por manter o streak por ${streak} dias` 
                        : 'Mantenha seu streak para bônus de EXP'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div>
              <p className="text-xs text-text-tertiary font-sora">Streak</p>
              <div className="flex items-center">
                <p className="font-bold text-lg font-space text-text-primary">
                  {streak === 1 ? '🔥 1 dia de streak' : `🔥 ${streak} dias de streak`}
                </p>
                {isNotableStreak && !isLegendaryStreak && (
                  <span className="ml-2 text-xs bg-valor-15 text-valor-60 px-2 py-0.5 rounded-full font-space border border-valor-30">
                    🔥 {streak}
                  </span>
                )}
                {isLegendaryStreak && (
                  <span className="ml-2 text-xs bg-achievement-15 text-achievement border border-achievement-30 px-2 py-0.5 rounded-full font-space animate-pulse shadow-glow-gold">
                    🔥 Lendário
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-gradient-to-br from-arcane to-arcane-60 p-2 rounded-full mr-3 text-white shadow-glow-purple border border-arcane-30">
                    <Award className="w-5 h-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Conquistas desbloqueadas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div>
              <p className="text-xs text-text-tertiary font-sora">Conquistas</p>
              <div className="flex items-center">
                <p className="font-bold text-lg font-space text-text-primary">{achievementsUnlocked}/{achievementsTotal}</p>
                {achievementsUnlocked > 0 && (
                  <span className="ml-2 text-xs bg-arcane-15 text-arcane-60 px-2 py-0.5 rounded-full font-space border border-arcane-30">
                    <Trophy className="w-3 h-3 inline mr-1" /> {achievementsUnlocked}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAchievementsSection;
