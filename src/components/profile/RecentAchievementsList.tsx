
import React from 'react';
import { ChevronRight, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  return (
    <Card className="rpg-panel overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-xpgold/5 to-energy/5 opacity-20"></div>
      
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center">
        <div className="flex items-center">
          <Trophy className="w-5 h-5 text-xpgold mr-2" />
          <CardTitle className="text-lg">Conquistas Recentes</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          className="text-xpgold flex items-center text-sm h-auto p-0 hover:text-xpgold" 
          onClick={() => navigate('/conquistas')}
        >
          Ver Todas <ChevronRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 relative z-10">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`
              flex items-center p-4 border-t border-arcane/10
              ${achievement.isLocked ? 'opacity-60' : ''}
            `}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center mr-3
              ${achievement.isLocked 
                ? 'bg-midnight-200 text-ghost-500' 
                : 'bg-xpgold/20 text-xpgold-500'}
            `}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${achievement.isLocked ? 'text-ghost-500' : 'text-ghost'}`}>
                {achievement.name}
              </p>
              {achievement.isLocked && (
                <p className="text-xs text-ghost-600">Complete desafios para desbloquear</p>
              )}
            </div>
            {!achievement.isLocked && (
              <div className="flex items-center">
                <span className="text-xs bg-xpgold/20 text-xpgold px-2 py-1 rounded-full font-mono">+50 XP</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentAchievementsList;
