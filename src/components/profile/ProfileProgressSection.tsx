
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
  const isHighXP = dailyXP > dailyXPCap * 0.7;
  
  return (
    <Card className="mt-3 shadow-md overflow-hidden border-none dark:bg-midnight-light/30 dark:border dark:border-arcane/10 rpg-card">
      <CardContent className="p-4 relative">
        {/* Subtle ambient glow effect for high XP */}
        {isHighXP && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-xp-gold-muted/5 rounded-full blur-xl"></div>
        )}
        
        <div className="relative z-10">
          <h3 className="text-base font-orbitron font-medium mb-3 dark:text-ghostwhite/90 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-energy-muted opacity-90" />
            Progresso Diário
          </h3>
          
          <XPProgressBar 
            current={dailyXP}
            total={dailyXPCap}
            label="EXP do Dia"
            className="bg-gradient-valor-xpgold"
            showSparkle={dailyXP > dailyXPCap * 0.7}
          />
          
          {hasStreakBonus && (
            <div className="mt-2 mb-2 text-xs flex justify-between items-center">
              <span className="text-gray-400 dark:text-gray-300/80 font-sora">Bônus de Sequência ({streak} dias)</span>
              <Badge className="bg-xp-gold-muted/90 text-midnight-dark font-ibm-plex text-xs">
                +{streakBonusPercent}% EXP
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex justify-between text-xs mt-4 font-sora relative z-10">
          <div className="flex items-center text-gray-500 dark:text-gray-400/90">
            <Clock className="w-3.5 h-3.5 mr-1 opacity-80" /> 
            {lastActivity}
          </div>
          
          <div className="text-xp-gold-muted font-medium font-ibm-plex flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 opacity-80" />
            {xpGain.replace('XP', 'EXP')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgressSection;
