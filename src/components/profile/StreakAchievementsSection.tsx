
import React from 'react';
import { Flame, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '@/components/profile/ProgressBar';

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
  const navigate = useNavigate();
  
  return (
    <Card className="rpg-panel mb-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-valor/5 to-xpgold/5 opacity-20"></div>
      
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center">
        <div className="flex items-center">
          <Award className="w-5 h-5 text-valor mr-2" />
          <CardTitle className="text-lg">Conquistas</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          className="text-valor-400 flex items-center text-sm h-auto p-0 hover:text-valor-300" 
          onClick={() => navigate('/conquistas')}
        >
          Ver Todas <ChevronRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 relative z-10">
        <div className="grid grid-cols-1 gap-4">
          <div className="p-3 rounded-lg border border-arcane/10 bg-midnight-100/40">
            <div className="flex items-center mb-3">
              <div className="mr-3 w-8 h-8 rounded-full bg-valor/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-valor" />
              </div>
              <div>
                <p className="text-xs text-ghost-500">Sequência Atual</p>
                <p className="font-medium font-mono text-valor">
                  {streak} {streak === 1 ? 'dia' : 'dias'}
                </p>
              </div>
            </div>
            <ProgressBar 
              current={streak} 
              target={7} 
              colorClass="bg-valor-500"
              percentage={false}
              label="Próximo Marco: 7 dias"
            />
          </div>
          
          <div className="p-3 rounded-lg border border-arcane/10 bg-midnight-100/40">
            <div className="flex items-center mb-3">
              <div className="mr-3 w-8 h-8 rounded-full bg-xpgold/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-xpgold" />
              </div>
              <div>
                <p className="text-xs text-ghost-500">Conquistas Desbloqueadas</p>
                <p className="font-medium font-mono text-xpgold">
                  {achievementsUnlocked}/{achievementsTotal}
                </p>
              </div>
            </div>
            <ProgressBar 
              current={achievementsUnlocked} 
              target={achievementsTotal} 
              colorClass="bg-xpgold"
              percentage={false}
              label="Total Completado"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAchievementsSection;
