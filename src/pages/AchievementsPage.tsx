import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import AchievementStats from '@/components/achievements/AchievementStats';
import AchievementSearch from '@/components/achievements/AchievementSearch';
import { useAchievementStore } from '@/stores/achievementStore';
import AchievementsByRank from '@/components/achievements/AchievementsByRank';
import RankDisplay from '@/components/achievements/RankDisplay';
import { RankService } from '@/services/rpg/RankService';
import { Award } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    achievements, 
    stats, 
    rankData,
    isLoading,
    fetchAll
  } = useAchievementStore();
  
  useEffect(() => {
    if (user?.id) {
      fetchAll(user.id);
    }
  }, [user?.id, fetchAll]);
  
  const achievementsByRank = achievements
    .filter(achievement => {
      if (filter === 'unlocked' && !achievement.unlocked) return false;
      if (filter === 'locked' && achievement.unlocked) return false;
      
      if (searchTerm && !achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .reduce((acc, achievement) => {
      if (!acc[achievement.rank]) {
        acc[achievement.rank] = [];
      }
      acc[achievement.rank].push(achievement);
      return acc;
    }, {});
  
  const ranks = RankService.RANK_THRESHOLDS.map(t => t.rank);
  
  const hasFilteredAchievements = Object.values(achievementsByRank)
    .some(rankAchievements => (rankAchievements as any).length > 0);
  
  return (
    <div className="pb-20 min-h-screen bg-midnight-base">
      <PageHeader 
        title="Conquistas" 
        showBackButton={true}
        rightContent={
          <div className="flex items-center">
            {rankData && (
              <div className="mr-2">
                <Shield className={`h-5 w-5 ${RankService.getRankColorClass(rankData.rank)}`} />
              </div>
            )}
            <span className={`font-orbitron text-sm font-bold ${
              rankData ? RankService.getRankColorClass(rankData.rank) : 'text-text-secondary'
            }`}>
              {rankData?.rank || 'Unranked'}
            </span>
          </div>
        }
      />
      
      <div className="px-4 pt-2 pb-4">
        <RankDisplay 
          rankData={rankData}
          loading={isLoading}
        />
        
        <AchievementStats 
          totalCount={stats?.total || 0}
          unlockedCount={stats?.unlocked || 0}
          loading={isLoading}
        />
        
        <AchievementSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="premium-card mb-4">
          <Tabs 
            defaultValue="all" 
            className="w-full"
            onValueChange={(value) => setFilter(value as any)}
          >
            <TabsList className="grid grid-cols-3 w-full bg-midnight-elevated border-b border-divider/30">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-arcane-30 rounded-full"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger 
                value="unlocked" 
                className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-arcane-30 rounded-full"
              >
                Desbloqueadas
              </TabsTrigger>
              <TabsTrigger 
                value="locked" 
                className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-arcane-30 rounded-full"
              >
                Bloqueadas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {!isLoading && !hasFilteredAchievements && (
          <EmptyState
            icon="Trophy"
            title="Nenhuma conquista encontrada"
            description="Tente ajustar seus filtros ou termos de busca"
          />
        )}
        
        {ranks.map(rank => (
          <AchievementsByRank
            key={rank}
            rank={rank}
            achievements={achievementsByRank[rank] || []}
            loading={isLoading}
            showUnlocked={filter === 'unlocked'}
          />
        ))}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default AchievementsPage;
