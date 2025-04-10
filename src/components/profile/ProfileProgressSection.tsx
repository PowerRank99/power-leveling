
import React from 'react';
import { Clock, Trophy, Info, Flame } from 'lucide-react';
import XPProgressBar from '@/components/profile/XPProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileProgressSectionProps {
  dailyXP: number;
  dailyXPCap: number;
  lastActivity: string;
  xpGain: string;
  streak?: number;
}

const ProfileProgressSection: React.FC<ProfileProgressSectionProps> = ({
  dailyXP,
  dailyXPCap,
  lastActivity,
  xpGain,
  streak = 0
}) => {
  // Calculate streak bonus (will be displayed if streak is 2 or more days)
  const hasStreakBonus = streak >= 2;
  const streakBonusPercent = Math.min(streak * 5, 35); // 5% per day up to 35%
  
  // Define milestone ticks for the XP progress
  const milestones = [
    { value: 100, label: 'Bronze', percent: (100 / dailyXPCap) * 100 },
    { value: 200, label: 'Prata', percent: (200 / dailyXPCap) * 100 },
    { value: dailyXPCap, label: 'Ouro', percent: 100 }
  ];
  
  return (
    <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300">
      <CardContent className="p-4">
        <div className="mb-1">
          <h3 className="section-header text-base orbitron-text font-bold text-text-primary">
            Progresso Diário
          </h3>
          
          <div className="flex items-center mb-3 justify-between">
            <div className="flex items-center text-text-secondary font-sora text-sm">
              <Clock className="w-4 h-4 mr-1 text-arcane-60" /> 
              <span>Tempo Ativo: {lastActivity}</span>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="xp-value animate-pulse-subtle flex items-center">
                    {xpGain.replace('XP', 'EXP')}
                    <Info className="w-3 h-3 ml-1 text-achievement-60" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">XP ganho hoje</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <XPProgressBar 
            current={dailyXP}
            total={dailyXPCap}
            label="EXP do Dia"
          />
          
          {/* Milestone ticks */}
          <div className="relative h-1 mt-1 mb-3">
            {milestones.map((milestone, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`absolute top-0 w-1 h-3 transform -translate-y-1 rounded-full 
                                ${dailyXP >= milestone.value ? 'bg-achievement shadow-glow-gold' : 'bg-divider'}`}
                      style={{ left: `${milestone.percent}%` }}
                    ></div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{milestone.label}: {milestone.value} XP</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          {hasStreakBonus && (
            <div className="mt-2 mb-2 text-xs flex justify-between items-center bg-valor-15 rounded-lg p-2 border border-valor-30">
              <div className="flex items-center">
                <div className="mr-2 bg-gradient-to-br from-valor to-valor-60 p-1 rounded-full shadow-glow-purple text-white">
                  <Flame className="w-3 h-3" /> 
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-text-secondary font-sora">
                        {streak < 7 ? (
                          <>Bônus de Sequência <span className="font-space">({streak} dias)</span></>
                        ) : (
                          <span className="font-medium text-valor">🔥 Streak Lendário <span className="font-space">({streak} dias)</span></span>
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Mantenha o streak para +EXP diário</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-valor font-space font-medium">+{streakBonusPercent}% EXP</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgressSection;
