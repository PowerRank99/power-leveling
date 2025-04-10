
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
    <Card className="mt-3 shadow-lg border-none dark:bg-midnight-light/50 dark:border dark:border-arcane/20 rpg-card card-glow">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-light/50 dark:bg-midnight/80 rounded-t-lg border-b border-arcane/10">
        <h3 className="text-lg font-orbitron font-bold text-gray-800 dark:text-ghostwhite">Conquistas Recentes</h3>
        <Link to="/conquistas" className="text-arcane flex items-center text-sm font-sora hover:text-arcane-light transition-colors">
          Ver Todas <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex justify-between gap-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex flex-col items-center justify-center rounded-lg w-24 h-24 
                ${achievement.isLocked 
                  ? 'bg-gray-100 dark:bg-midnight/80 text-gray-400 shadow-inner' 
                  : achievement.id === 'streak' 
                    ? 'bg-gradient-valor-xpgold text-white shadow-glow-xpgold' 
                    : achievement.id === 'workouts' 
                      ? 'bg-gradient-arcane-energy text-white shadow-glow-energy' 
                      : 'bg-gradient-arcane-valor text-white shadow-glow-md'
                } 
                transform transition-transform hover:scale-105 cursor-pointer 
                ${!achievement.isLocked ? 'animate-glow-pulse' : ''}`}
            >
              <div className={`flex items-center justify-center ${!achievement.isLocked ? 'animate-float' : ''}`}>
                {achievement.isLocked ? <Lock className="h-6 w-6" /> : achievement.icon}
              </div>
              <span className="text-sm text-center mt-2 font-medium font-orbitron tracking-wide">
                {achievement.name}
              </span>
              
              {/* Add sparkle/glow effect for unlocked achievements */}
              {!achievement.isLocked && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 rounded-lg opacity-20 bg-gradient-radial"></div>
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
