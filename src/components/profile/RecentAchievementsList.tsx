
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
    <Card className="mt-3 shadow-sm border-none">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Conquistas Recentes</h3>
        <Link to="/conquistas" className="text-fitblue flex items-center text-sm">
          Ver Todas <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex justify-between gap-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex flex-col items-center justify-center rounded-full w-20 h-20 ${
                achievement.isLocked 
                  ? 'bg-gray-100 text-gray-400' 
                  : achievement.id === 'streak' 
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' 
                    : achievement.id === 'workouts' 
                      ? 'bg-gradient-to-br from-fitblue to-fitblue-700 text-white' 
                      : 'bg-gradient-to-br from-fitpurple to-fitpurple-700 text-white'
              } shadow-md transform transition-transform hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-center">
                {achievement.icon}
              </div>
              <span className="text-xs text-center mt-1 font-medium">{achievement.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAchievementsList;
