
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AchievementCircle from './achievements/AchievementCircle';
import AchievementDialog from './achievements/AchievementDialog';
import { getMockAchievements, Achievement } from './MockAchievements';

interface RecentAchievementsListProps {
  achievements: Achievement[];
}

const RecentAchievementsList: React.FC<RecentAchievementsListProps> = ({ achievements }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const handleAchievementClick = (achievement: Achievement) => {
    // If locked, add progress data to the achievement
    const achievementWithProgress = achievement.isLocked 
      ? {
          ...achievement,
          progress: getAchievementProgress(achievement.id)
        }
      : achievement;
    
    setSelectedAchievement(achievementWithProgress);
  };
  
  const closeModal = () => {
    setSelectedAchievement(null);
  };
  
  // Get achievement progress data
  const getAchievementProgress = (id: string) => {
    const progressMap: Record<string, { current: number, total: number }> = {
      'streak': { current: 2, total: 7 },
      'workouts': { current: 50, total: 100 },
      'locked': { current: 0, total: 1 }
    };
    
    return progressMap[id] || { current: 0, total: 1 };
  };
  
  return (
    <>
      <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300">
        <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-card bg-opacity-50 backdrop-blur-sm border-b border-divider/30">
          <h3 className="section-header text-lg orbitron-text font-bold text-text-primary">
            Conquistas
          </h3>
          <Link to="/conquistas" className="text-arcane flex items-center text-sm font-sora hover:text-arcane-60 transition-colors">
            Ver Todas as Conquistas 🏅 <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="flex justify-between gap-2">
            {achievements.map((achievement) => (
              <AchievementCircle
                key={achievement.id}
                id={achievement.id}
                icon={achievement.icon}
                name={achievement.name}
                isLocked={achievement.isLocked}
                onClick={() => handleAchievementClick(achievement)}
                progress={achievement.isLocked ? getAchievementProgress(achievement.id) : undefined}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Modal */}
      <AchievementDialog 
        achievement={selectedAchievement}
        isOpen={selectedAchievement !== null}
        onClose={closeModal}
      />
    </>
  );
};

export default RecentAchievementsList;
