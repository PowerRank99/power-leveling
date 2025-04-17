
import React from 'react';
import { Achievement } from '@/services/rpg/AchievementService';
import { RankService } from '@/services/rpg/RankService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AchievementCard from '@/components/achievements/AchievementCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Lock } from 'lucide-react';

interface AchievementsByRankProps {
  rank: string;
  achievements: Achievement[];
  loading?: boolean;
  showUnlocked?: boolean;
}

const AchievementsByRank: React.FC<AchievementsByRankProps> = ({ 
  rank, 
  achievements, 
  loading = false,
  showUnlocked = false
}) => {
  const rankColorClass = RankService.getRankColorClass(rank);
  const rankBackgroundClass = RankService.getRankBackgroundClass(rank);
  const rankDescription = RankService.getRankDescription(rank);
  
  const filteredAchievements = showUnlocked 
    ? achievements.filter(a => a.unlocked) 
    : achievements;
  
  if (loading) {
    return (
      <Card className="premium-card mb-6">
        <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-card bg-opacity-50 backdrop-blur-sm border-b border-divider/30">
          <div className="flex items-center">
            <Skeleton className="h-6 w-20 mr-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex flex-col items-center p-4 rounded-lg bg-midnight-elevated">
                <Skeleton className="h-16 w-16 rounded-full mb-3" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-20 mt-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show only if there are achievements to display
  if (filteredAchievements.length === 0) {
    return null;
  }
  
  // Count unlocked achievements
  const unlockedCount = filteredAchievements.filter(a => a.unlocked).length;
  
  return (
    <Card className="premium-card mb-6">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-card bg-opacity-50 backdrop-blur-sm border-b border-divider/30">
        <div className="flex items-center">
          <h3 className={`text-xl font-orbitron font-bold mr-2 ${rankColorClass}`}>
            Rank {rank}
          </h3>
          <span className="text-sm text-text-secondary font-sora">{rankDescription}</span>
        </div>
        
        <div className="flex items-center">
          <Badge 
            className={`${rankBackgroundClass} border-none text-text-primary shadow-subtle`}
          >
            {unlockedCount}/{filteredAchievements.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 mx-auto text-text-tertiary mb-2" />
            <p className="text-text-secondary font-sora">
              Nenhuma conquista {showUnlocked ? 'desbloqueada' : ''} encontrada neste rank.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAchievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementsByRank;
