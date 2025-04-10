
import React from 'react';
import { Clock, Info } from 'lucide-react';
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
  // Define milestone ticks for the XP progress
  const milestones = [
    { value: 100, label: 'Bronze', percent: (100 / dailyXPCap) * 100 },
    { value: 200, label: 'Prata', percent: (200 / dailyXPCap) * 100 },
    { value: dailyXPCap, label: 'Ouro', percent: 100 }
  ];
  
  // Check if milestones are achieved
  const bronzeAchieved = dailyXP >= 100;
  const silverAchieved = dailyXP >= 200;
  const goldAchieved = dailyXP >= dailyXPCap;
  
  return (
    <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300 border border-divider/30 shadow-subtle">
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
                  <div className="xp-value animate-pulse-subtle flex items-center" style={{ color: 'rgba(250, 204, 21, 0.85)' }}>
                    {xpGain.replace('XP', 'EXP')}
                    <Info className="w-3 h-3 ml-1" style={{ color: 'rgba(250, 204, 21, 0.6)' }} />
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
                                ${dailyXP >= milestone.value 
                                  ? 'bg-achievement shadow-glow-gold animate-pulse-subtle' 
                                  : 'bg-divider'}`}
                      style={{ left: `${milestone.percent}%` }}
                    ></div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">
                      {dailyXP >= milestone.value 
                        ? `Recompensa de ${milestone.label} alcançada: ${milestone.value} XP` 
                        : `${milestone.label}: ${milestone.value} XP`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          {/* Display milestone achievements */}
          {(bronzeAchieved || silverAchieved || goldAchieved) && (
            <div className="flex gap-1 mb-2">
              {bronzeAchieved && (
                <span className="text-xs px-2 py-0.5 bg-amber-900/30 text-amber-500 rounded-full border border-amber-800/50">
                  Bronze
                </span>
              )}
              {silverAchieved && (
                <span className="text-xs px-2 py-0.5 bg-gray-400/20 text-gray-300 rounded-full border border-gray-400/50">
                  Prata
                </span>
              )}
              {goldAchieved && (
                <span className="text-xs px-2 py-0.5 bg-achievement-15 text-achievement rounded-full border border-achievement-30 animate-pulse-subtle">
                  Ouro
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgressSection;
