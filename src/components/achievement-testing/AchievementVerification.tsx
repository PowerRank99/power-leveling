
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AchievementService } from '@/services/rpg/AchievementService';
import { Achievement } from '@/types/achievementTypes';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Medal, Trophy, Star, Sparkles, Share2, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AchievementVerificationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const AchievementVerification: React.FC<AchievementVerificationProps> = ({ userId, addLogEntry }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<{
    level: number;
    xp: number;
    rank: string;
    nextRank: string | null;
    pointsToNextRank: number | null;
  }>({
    level: 1,
    xp: 0,
    rank: 'Unranked',
    nextRank: 'E',
    pointsToNextRank: 10
  });
  
  const { addNotification } = useAchievementNotificationStore();
  
  useEffect(() => {
    if (userId) {
      fetchAchievements();
      fetchUserStats();
    }
  }, [userId]);
  
  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Format achievements to match type
      const formattedAchievements = data.map(a => ({
        id: a.id || '',
        name: a.name || '',
        description: a.description || '',
        category: a.category || '',
        rank: a.rank || 'E',
        points: a.points || 1,
        xpReward: a.xp_reward || 0,
        iconName: a.icon_name || '',
        requirements: a.requirements || {}
      }));
      
      setAchievements(formattedAchievements);
      if (formattedAchievements.length > 0) {
        setSelectedAchievement(formattedAchievements[0]);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Error', {
        description: 'Failed to fetch achievements',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserStats = async () => {
    try {
      // Get user profile info
      const { data, error } = await supabase
        .from('profiles')
        .select('level, xp, rank, achievement_points')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Get achievement stats for this user
      const stats = await AchievementService.getAchievementStats(userId);
      
      setUserStats({
        level: data?.level || 1,
        xp: data?.xp || 0,
        rank: data?.rank || 'Unranked',
        nextRank: stats.nextRank,
        pointsToNextRank: stats.pointsToNextRank
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };
  
  const awardAchievement = async () => {
    if (!userId || !selectedAchievement) {
      toast.error('Error', {
        description: 'Please select a user and achievement',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Award the achievement
      await AchievementService.awardAchievement(userId, selectedAchievement.id);
      
      // Log success
      addLogEntry(
        'Achievement Awarded', 
        `"${selectedAchievement.name}" (${selectedAchievement.rank}) - XP: ${selectedAchievement.xpReward}`
      );
      
      // Trigger achievement notification
      addNotification({
        id: selectedAchievement.id,
        title: selectedAchievement.name,
        description: selectedAchievement.description,
        xpReward: selectedAchievement.xpReward,
        rank: selectedAchievement.rank as any,
        points: selectedAchievement.points,
        iconName: selectedAchievement.iconName,
        timestamp: new Date().toISOString()
      });
      
      // Refresh user stats
      await fetchUserStats();
      
      toast.success('Achievement Awarded!', {
        description: `${selectedAchievement.xpReward} XP has been awarded.`,
      });
    } catch (error) {
      console.error('Error awarding achievement:', error);
      toast.error('Error', {
        description: 'Failed to award achievement',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const displayAchievementIcon = (rank: string) => {
    switch (rank) {
      case 'S':
        return <Trophy className="h-5 w-5 text-achievement" />;
      case 'A':
        return <Medal className="h-5 w-5 text-achievement-60" />;
      case 'B':
        return <Star className="h-5 w-5 text-valor" />;
      case 'C':
        return <Target className="h-5 w-5 text-arcane" />;
      default:
        return <Sparkles className="h-5 w-5 text-arcane-60" />;
    }
  };
  
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Medal className="mr-2 h-5 w-5 text-achievement" />
          Achievement Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Select Achievement</label>
              <Select 
                value={selectedAchievement?.id || ''} 
                onValueChange={(value) => {
                  const achievement = achievements.find(a => a.id === value);
                  if (achievement) {
                    setSelectedAchievement(achievement);
                  }
                }}
                disabled={isLoading || achievements.length === 0}
              >
                <SelectTrigger className="bg-midnight-elevated border-divider">
                  <SelectValue placeholder="Select an achievement" />
                </SelectTrigger>
                <SelectContent>
                  {achievements.map((achievement) => (
                    <SelectItem key={achievement.id} value={achievement.id}>
                      <div className="flex items-center">
                        {displayAchievementIcon(achievement.rank)}
                        <span className="ml-2">{achievement.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-midnight-card border border-divider/30 rounded-lg p-4">
              <h3 className="text-md font-orbitron mb-3 text-text-primary">User Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Level:</span>
                  <span className="font-space text-arcane">{userStats.level}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">XP:</span>
                  <span className="font-space">{userStats.xp}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Rank:</span>
                  <Badge className={`
                    ${userStats.rank === 'S' ? 'bg-achievement-15 text-achievement border-achievement-30' : 
                     userStats.rank === 'A' ? 'bg-achievement-15 text-achievement-60 border-achievement-30' : 
                     userStats.rank === 'B' ? 'bg-valor-15 text-valor border-valor-30' : 
                     userStats.rank === 'C' ? 'bg-arcane-15 text-arcane border-arcane-30' : 
                     userStats.rank === 'D' ? 'bg-arcane-15 text-arcane-60 border-arcane-30' : 
                     userStats.rank === 'E' ? 'bg-midnight-elevated text-text-secondary border-divider' : 
                     'bg-midnight-elevated text-text-tertiary border-divider'}
                  `}>
                    {userStats.rank}
                  </Badge>
                </div>
                
                {userStats.nextRank && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Next rank:</span>
                    <div className="flex items-center">
                      <Badge className={`
                        ${userStats.nextRank === 'S' ? 'bg-achievement-15 text-achievement border-achievement-30' : 
                         userStats.nextRank === 'A' ? 'bg-achievement-15 text-achievement-60 border-achievement-30' : 
                         userStats.nextRank === 'B' ? 'bg-valor-15 text-valor border-valor-30' : 
                         userStats.nextRank === 'C' ? 'bg-arcane-15 text-arcane border-arcane-30' : 
                         userStats.nextRank === 'D' ? 'bg-arcane-15 text-arcane-60 border-arcane-30' : 
                         userStats.nextRank === 'E' ? 'bg-midnight-elevated text-text-secondary border-divider' : 
                         'bg-midnight-elevated text-text-tertiary border-divider'}
                      `}>
                        {userStats.nextRank}
                      </Badge>
                      <span className="ml-2 text-xs text-text-tertiary">
                        ({userStats.pointsToNextRank} points needed)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {selectedAchievement && (
                <motion.div
                  key={selectedAchievement.id}
                  className="bg-midnight-card rounded-lg p-4 border border-divider/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-3">
                    <div className={`
                      p-2 rounded-full mr-3
                      ${selectedAchievement.rank === 'S' ? 'bg-achievement-15 text-achievement' : 
                       selectedAchievement.rank === 'A' ? 'bg-achievement-15 text-achievement-60' : 
                       selectedAchievement.rank === 'B' ? 'bg-valor-15 text-valor' : 
                       selectedAchievement.rank === 'C' ? 'bg-arcane-15 text-arcane' : 
                       'bg-arcane-15 text-arcane-60'}
                    `}>
                      {displayAchievementIcon(selectedAchievement.rank)}
                    </div>
                    <div>
                      <h3 className={`font-orbitron font-bold
                        ${selectedAchievement.rank === 'S' ? 'text-achievement' : 
                         selectedAchievement.rank === 'A' ? 'text-achievement-60' : 
                         selectedAchievement.rank === 'B' ? 'text-valor' : 
                         selectedAchievement.rank === 'C' ? 'text-arcane' : 
                         'text-arcane-60'}
                      `}>
                        {selectedAchievement.name}
                      </h3>
                      <div className="flex items-center text-xs text-text-tertiary">
                        <Badge className="mr-2" variant="outline">{selectedAchievement.category}</Badge>
                        <Badge variant="outline">Rank {selectedAchievement.rank}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-text-secondary text-sm mb-4">
                    {selectedAchievement.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">XP Reward:</span>
                    <span className="font-space text-arcane">{selectedAchievement.xpReward} XP</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Achievement Points:</span>
                    <span className="font-space text-achievement">{selectedAchievement.points} pts</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={awardAchievement} 
                disabled={isLoading || !userId || !selectedAchievement}
                className="w-full bg-achievement text-midnight-deep hover:bg-achievement-60 transition-colors shadow-glow-gold"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-midnight-deep rounded-full" />
                    Awarding...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    Award Achievement
                  </span>
                )}
              </Button>
              
              <Button 
                onClick={() => {
                  if (selectedAchievement) {
                    // Trigger a preview notification
                    addNotification({
                      id: selectedAchievement.id,
                      title: selectedAchievement.name,
                      description: selectedAchievement.description,
                      xpReward: selectedAchievement.xpReward,
                      rank: selectedAchievement.rank as any,
                      points: selectedAchievement.points,
                      iconName: selectedAchievement.iconName,
                      timestamp: new Date().toISOString()
                    });
                    
                    addLogEntry(
                      'Achievement Notification Preview', 
                      `"${selectedAchievement.name}" (${selectedAchievement.rank})`
                    );
                  }
                }} 
                variant="outline"
                disabled={!selectedAchievement}
                className="w-full border-divider bg-midnight-elevated"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Preview Notification
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementVerification;
