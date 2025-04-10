
import React from 'react';
import { ChevronRight } from 'lucide-react';
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
    <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-card bg-opacity-50 backdrop-blur-sm border-b border-divider">
        <h3 className="text-lg font-orbitron font-bold text-text-primary tracking-wide">Conquistas Recentes</h3>
        <Link to="/conquistas" className="text-arcane flex items-center text-sm font-sora hover:text-arcane-60 transition-colors">
          Ver Todas <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex justify-between gap-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex flex-col items-center justify-center rounded-full w-20 h-20 achievement-circle ${
                achievement.isLocked 
                  ? 'bg-midnight-elevated text-inactive border border-divider' 
                  : achievement.id === 'streak' 
                    ? 'bg-gradient-to-br from-valor to-achievement text-text-primary border border-valor-30' 
                    : achievement.id === 'workouts' 
                      ? 'bg-gradient-to-br from-arcane to-arcane-60 text-text-primary border border-arcane-30' 
                      : 'bg-gradient-to-br from-arcane to-valor text-text-primary border border-arcane-30'
              } shadow-subtle transform transition-all duration-300 hover:scale-105 hover:shadow-elevated cursor-pointer`}
            >
              <div className="flex items-center justify-center">
                {achievement.icon}
              </div>
              <span className="text-xs text-center mt-1 font-medium font-sora px-1">{achievement.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAchievementsList;
