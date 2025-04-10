
import React from 'react';
import { Clock, Sparkles, TrendingUp } from 'lucide-react';
import XPProgressBar from '@/components/profile/XPProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  
  return (
    <Card className="mt-3 shadow-lg overflow-hidden border-none dark:bg-midnight-light/50 dark:border dark:border-arcane/20 rpg-card card-glow">
      <CardContent className="p-4">
        <div className="mb-1">
          <h3 className="text-base font-orbitron font-bold mb-3 dark:text-ghostwhite flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-energy" />
            Progresso Diário
          </h3>
          
          <XPProgressBar 
            current={dailyXP}
            total={dailyXPCap}
            label="EXP do Dia"
            className="bg-gradient-valor-xpgold"
            showSparkle={dailyXP > dailyXPCap * 0.5}
          />
          
          {hasStreakBonus && (
            <div className="mt-2 mb-2 text-xs flex justify-between items-center">
              <span className="text-gray-400 dark:text-gray-300 font-sora">Bônus de Sequência ({streak} dias)</span>
              <Badge className="bg-xpgold text-midnight-dark font-ibm-plex shadow-glow-xpgold">
                +{streakBonusPercent}% EXP
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex justify-between text-sm mt-4 font-sora">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" /> 
            {lastActivity}
          </div>
          
          <div className="text-xpgold font-medium font-ibm-plex flex items-center animate-pulse">
            <Sparkles className="w-4 h-4 mr-1" />
            {xpGain.replace('XP', 'EXP')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgressSection;
