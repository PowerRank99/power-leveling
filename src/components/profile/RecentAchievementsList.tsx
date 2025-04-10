
import React from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Achievement {
  id: string;
  icon: React.ReactNode;
  name: string;
  isLocked?: boolean;
}

interface RecentAchievementsListProps {
  achievements: Achievement[];
}

const RecentAchievementsList: React.FC<RecentAchievementsListProps> = ({ achievements }) => {
  return (
    <Card className="mt-3 shadow-md border-none dark:bg-midnight-light/30 dark:border dark:border-arcane/10 rpg-card">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-light/20 dark:bg-midnight/40 rounded-t-lg border-b border-arcane/5">
        <h3 className="text-base font-orbitron font-medium text-gray-800 dark:text-ghostwhite/90">Conquistas Recentes</h3>
        <Link to="/conquistas" className="text-arcane-muted/90 flex items-center text-sm font-sora hover:text-arcane-muted transition-colors">
          Ver Todas <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex justify-between gap-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex flex-col items-center justify-center rounded-lg w-24 h-24 relative
                ${achievement.isLocked 
                  ? 'bg-gray-100/5 dark:bg-midnight/30 text-gray-400/80 border border-white/5' 
                  : achievement.id === 'streak' 
                    ? 'bg-gradient-to-br from-valor-muted/80 to-xp-gold-muted/80 text-white/90 shadow-sm' 
                    : achievement.id === 'workouts' 
                      ? 'bg-gradient-to-br from-arcane-muted/80 to-energy-muted/80 text-white/90 shadow-sm' 
                      : 'bg-gradient-to-br from-arcane-muted/80 to-valor-muted/80 text-white/90 shadow-sm'
                } 
                transform transition-all hover:scale-105 hover:translate-y-[-1px] cursor-pointer`}
            >
              <div className={`flex items-center justify-center mt-2`}>
                {achievement.isLocked ? <Lock className="h-5 w-5 opacity-70" /> : achievement.icon}
              </div>
              <span className="text-sm text-center mt-2 font-medium font-orbitron tracking-wide">
                {achievement.name}
              </span>
              
              {/* Subtle glow/overlay for unlocked achievements */}
              {!achievement.isLocked && (
                <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-70"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAchievementsList;
