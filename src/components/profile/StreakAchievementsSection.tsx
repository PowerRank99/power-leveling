
import React from 'react';
import { Flame, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  // Determine if we should show special animations
  const isHighStreak = streak >= 7;
  const hasUnlockedManyAchievements = achievementsUnlocked > achievementsTotal * 0.5;
  
  return (
    <Card className="mt-3 shadow-md overflow-hidden border-arcane-purple-30 bg-card-alt/30 rpg-card">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-1 flex items-center justify-center p-3 border-r border-arcane-purple-30/20 relative overflow-hidden">
            {/* Subtle background effect for high streaks */}
            {isHighStreak && (
              <div className="absolute inset-0 bg-gradient-to-r from-valor-crimson-60/5 to-xp-gold-60/5"></div>
            )}
            
            <div className={`bg-gradient-to-br from-valor-crimson-60/90 to-xp-gold-60/90 p-1.5 rounded-full mr-3 text-white shadow-subtle ${isHighStreak ? 'opacity-90 glow-gold' : 'opacity-80'}`}>
              <Flame className="w-4 h-4" />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-ghost-white-50 dark:text-ghost-white-50/90 font-sora">Streak</p>
              <p className={`font-medium text-base font-ibm-plex flex items-center text-ghost-white-95 ${isHighStreak ? 'text-xp-gold-60' : ''}`}>
                {streak} 
                <span className="font-sora ml-1 text-xs text-ghost-white-75">dias</span>
              </p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden">
            {/* Subtle background effect for many achievements */}
            {hasUnlockedManyAchievements && (
              <div className="absolute inset-0 bg-gradient-to-r from-arcane-purple-30/5 to-energy-cyan/5"></div>
            )}
            
            <div className={`bg-gradient-to-br from-arcane-purple-60/90 to-energy-cyan/90 p-1.5 rounded-full mr-3 text-white shadow-subtle ${hasUnlockedManyAchievements ? 'opacity-90 glow-purple' : 'opacity-80'}`}>
              <Award className="w-4 h-4" />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-ghost-white-50 dark:text-ghost-white-50/90 font-sora">Conquistas</p>
              <p className={`font-medium text-base font-ibm-plex flex items-center text-ghost-white-95 ${hasUnlockedManyAchievements ? 'text-arcane-purple-90' : ''}`}>
                {achievementsUnlocked}
                <span className="font-sora text-xs text-ghost-white-75">/{achievementsTotal}</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAchievementsSection;
