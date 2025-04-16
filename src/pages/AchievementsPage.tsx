
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Achievement } from '@/types/achievementTypes';
import { AchievementService } from '@/services/rpg/AchievementService';
import AchievementNotificationTester from '@/components/achievements/AchievementNotificationTester';
import AchievementErrorHandler from '@/components/profile/AchievementErrorHandler';
import AchievementStatsCard from '@/components/achievements/AchievementStatsCard';
import AchievementsEmptyState from '@/components/achievements/AchievementsEmptyState';
import AchievementsLoadingSkeleton from '@/components/achievements/AchievementsLoadingSkeleton';
import AchievementsRankList from '@/components/achievements/AchievementsRankList';

const AchievementsPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, points: 0, totalXp: 0 });
  const [expandedRank, setExpandedRank] = useState<string | null>('S');
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (profile?.id) {
        setIsLoading(true);
        setError(null);
        
        try {
          const achievementsResponse = await AchievementService.getUnlockedAchievements(profile.id);
          
          if (!achievementsResponse.success) {
            setError({ 
              error: { 
                message: achievementsResponse.error?.message || 'Não foi possível carregar conquistas', 
                technical: achievementsResponse.error?.details 
              } 
            });
            return;
          }
          
          setAchievements(achievementsResponse.data);
          
          const achievementStatsResponse = await AchievementService.getAchievementStats(profile.id);
          
          if (!achievementStatsResponse.success) {
            setError({ 
              error: { 
                message: achievementStatsResponse.error?.message || 'Não foi possível carregar estatísticas', 
                technical: achievementStatsResponse.error?.details 
              } 
            });
            return;
          }
          
          const statsData = achievementStatsResponse.data;
          
          setStats({
            total: statsData.total,
            unlocked: statsData.unlocked,
            points: statsData.points,
            totalXp: achievementsResponse.data.reduce((sum, a) => sum + a.xpReward, 0)
          });

          if (achievementsResponse.data.length > 0) {
            playAchievementSound(getHighestRank(achievementsResponse.data));
          }
        } catch (error) {
          console.error('Error fetching achievements:', error);
          setError({ 
            error: { 
              message: "Não foi possível carregar suas conquistas", 
              technical: error instanceof Error ? error.message : String(error) 
            }
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchAchievements();
  }, [profile?.id, toast]);
  
  const getHighestRank = (achievements: Achievement[]): string => {
    const ranks = ['S', 'A', 'B', 'C', 'D', 'E'] as const;
    for (const rank of ranks) {
      if (achievements.some(a => a.rank === rank)) {
        return rank;
      }
    }
    return 'E';
  };
  
  const playAchievementSound = (rank: string) => {
    console.log(`Playing ${rank} rank sound effect`);
  };
  
  const handleRetry = () => {
    setError(null);
    if (profile?.id) {
      setIsLoading(true);
      // This will trigger the useEffect
    }
  };
  
  const toggleRank = (rank: string) => {
    setExpandedRank(expandedRank === rank ? null : rank);
  };
  
  const getRandomHint = () => {
    const hints = [
      "A constância forja a verdadeira força.",
      "Desafie seus limites repetidamente para transcender.",
      "Aqueles que persistem quando outros desistem encontrarão poder.",
      "Variação nos exercícios expande seu potencial.",
      "O amanhecer traz oportunidades especiais para os dedicados.",
      "A jornada em conjunto revela caminhos inesperados.",
      "Desafie a si mesmo quando as circunstâncias forem adversas."
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };
  
  const handleHintClick = () => {
    setShowHint(true);
    toast({
      title: "Dica misteriosa",
      description: getRandomHint(),
      duration: 5000,
    });
    
    setTimeout(() => setShowHint(false), 5000);
  };
  
  return (
    <div className="min-h-screen bg-midnight-deep pb-20">
      <PageHeader 
        title="Conquistas Reveladas" 
        showBackButton={true}
        rightContent={
          <motion.button 
            className="p-2 rounded-full bg-midnight-card text-text-secondary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleHintClick}
            disabled={showHint}
          >
            <HelpCircle className="h-5 w-5" />
          </motion.button>
        }
      />
      
      <div className="px-4 pt-2 pb-4">
        {error ? (
          <AchievementErrorHandler 
            error={error} 
            onRetry={handleRetry} 
            className="mt-4" 
          />
        ) : (
          <>
            <AchievementStatsCard stats={stats} />
            
            {isLoading && <AchievementsLoadingSkeleton />}
            
            {!isLoading && achievements.length === 0 && (
              <AchievementsEmptyState onHintClick={handleHintClick} />
            )}
            
            {!isLoading && (
              <AchievementsRankList 
                achievements={achievements}
                expandedRank={expandedRank}
                onToggleRank={toggleRank}
              />
            )}
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 border border-divider rounded-lg">
                <AchievementNotificationTester />
              </div>
            )}
          </>
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default AchievementsPage;
