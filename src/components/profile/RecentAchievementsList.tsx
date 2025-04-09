
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Conquistas Recentes</h3>
        <Link to="/conquistas" className="text-fitblue flex items-center text-sm">
          Ver Todas <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex justify-between gap-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex flex-col items-center justify-center p-3 rounded-full w-[75px] h-[75px] ${
              achievement.isLocked 
                ? 'bg-gray-100 text-gray-400' 
                : achievement.id === 'streak' 
                  ? 'bg-orange-100' 
                  : achievement.id === 'workouts' 
                    ? 'bg-fitblue-100' 
                    : 'bg-fitpurple-100'
            } ${achievement.isLocked ? '' : 'shadow-sm'}`}
          >
            <div className="flex items-center justify-center">
              {achievement.icon}
            </div>
            <span className="text-xs text-center mt-1 font-medium">{achievement.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAchievementsList;
