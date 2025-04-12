
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AchievementService } from '@/services/rpg/AchievementService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Award, CheckCircle2, Search } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  xp_reward: number;
  rank: string;
  category: string;
}

interface AchievementVerificationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const AchievementVerification: React.FC<AchievementVerificationProps> = ({ userId, addLogEntry }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string>('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAwarding, setIsAwarding] = useState(false);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);

  // Load achievements on component mount
  useEffect(() => {
    if (userId) {
      fetchAchievements();
    }
  }, [userId]);

  // Filter achievements based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAchievements(achievements);
    } else {
      const filtered = achievements.filter(achievement => 
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAchievements(filtered);
    }
  }, [searchTerm, achievements]);

  // Update selected achievement when ID changes
  useEffect(() => {
    if (selectedAchievementId) {
      const achievement = achievements.find(a => a.id === selectedAchievementId) || null;
      setSelectedAchievement(achievement);
    } else {
      setSelectedAchievement(null);
    }
  }, [selectedAchievementId, achievements]);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('id, name, description, xp_reward, rank, category')
        .order('rank', { ascending: false })
        .order('name');

      if (error) throw error;

      setAchievements(data || []);
      setFilteredAchievements(data || []);
      
      // Select first achievement if available
      if (data && data.length > 0) {
        setSelectedAchievementId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Error loading achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAwardAchievement = async () => {
    if (!userId || !selectedAchievementId) {
      toast.error('Please select a user and achievement');
      return;
    }

    setIsAwarding(true);
    try {
      const success = await AchievementService.awardAchievement(userId, selectedAchievementId);

      if (success) {
        addLogEntry(
          'Achievement Awarded',
          `Achievement: ${selectedAchievement?.name || selectedAchievementId}, XP: ${selectedAchievement?.xp_reward || 0}`
        );

        toast.success('Achievement Awarded', {
          description: `The user has been awarded the achievement "${selectedAchievement?.name}".`,
        });
      } else {
        toast.error('Failed to award achievement');
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
      toast.error('Error awarding achievement');
    } finally {
      setIsAwarding(false);
    }
  };

  // Get color based on rank
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-achievement border-achievement';
      case 'A': return 'text-achievement-60 border-achievement-60';
      case 'B': return 'text-valor border-valor';
      case 'C': return 'text-arcane-60 border-arcane-60';
      case 'D': return 'text-arcane border-arcane';
      case 'E': return 'text-arcane-30 border-arcane-30';
      default: return 'text-text-secondary border-divider';
    }
  };

  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Award className="mr-2 h-5 w-5 text-achievement" />
          Achievement Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input
              placeholder="Search achievements by name, description or category..."
              className="bg-midnight-elevated border-divider pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievementSelect">Select Achievement</Label>
            <Select 
              value={selectedAchievementId} 
              onValueChange={setSelectedAchievementId}
              disabled={isLoading}
            >
              <SelectTrigger id="achievementSelect" className="bg-midnight-elevated border-divider">
                <SelectValue placeholder={isLoading ? "Loading achievements..." : "Select an achievement"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredAchievements.map((achievement) => (
                  <SelectItem key={achievement.id} value={achievement.id}>
                    {achievement.name} ({achievement.rank})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAchievement && (
            <div className="bg-midnight-elevated rounded-lg p-4 border border-divider/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron text-md">{selectedAchievement.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full border ${getRankColor(selectedAchievement.rank)}`}>
                  Rank {selectedAchievement.rank}
                </span>
              </div>
              
              <p className="text-text-secondary text-sm">{selectedAchievement.description}</p>
              
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">XP Reward:</span>
                <span className="text-arcane font-space">+{selectedAchievement.xp_reward} XP</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Category:</span>
                <span className="text-text-primary">{selectedAchievement.category}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleAwardAchievement} 
            disabled={isAwarding || !userId || !selectedAchievementId}
            className="w-full bg-achievement-60 hover:bg-achievement text-white"
          >
            {isAwarding ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                Awarding...
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Award Achievement
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementVerification;
