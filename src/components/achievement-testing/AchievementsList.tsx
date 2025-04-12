
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface AchievementsListProps {
  userId: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rank: string;
  xp_reward: number;
  requirements: any;
  points: number;
}

const AchievementsList: React.FC<AchievementsListProps> = ({ userId }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rankFilter, setRankFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch achievements on mount
  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, rankFilter, achievements]);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: false })
        .order('name');

      if (error) throw error;

      if (data) {
        setAchievements(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(a => a.category))).sort();
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...achievements];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(achievement => 
        achievement.name.toLowerCase().includes(term) || 
        achievement.description.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === categoryFilter);
    }

    // Apply rank filter
    if (rankFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.rank === rankFilter);
    }

    setFilteredAchievements(filtered);
  };

  // Format requirements for display
  const formatRequirements = (requirements: any): string => {
    if (!requirements) return 'No requirements';
    
    try {
      const req = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
      
      if (req.type === 'milestone' && req.count) {
        return `Complete ${req.count} ${req.activity || 'activities'}`;
      }
      
      if (req.type === 'streak' && req.days) {
        return `Maintain a streak of ${req.days} days`;
      }
      
      if (req.type === 'xp' && req.amount) {
        return `Earn a total of ${req.amount} XP`;
      }
      
      if (req.type === 'pr' && req.count) {
        return `Set ${req.count} personal records`;
      }
      
      // Fallback to JSON string if we can't parse it meaningfully
      return JSON.stringify(req);
    } catch (e) {
      return typeof requirements === 'string' ? requirements : JSON.stringify(requirements);
    }
  };

  // Get color based on rank
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-achievement bg-achievement-15 border-achievement';
      case 'A': return 'text-achievement-60 bg-achievement-15/50 border-achievement-60';
      case 'B': return 'text-valor bg-valor-15 border-valor';
      case 'C': return 'text-arcane-60 bg-arcane-15 border-arcane-60';
      case 'D': return 'text-arcane bg-arcane-15/50 border-arcane';
      case 'E': return 'text-arcane-30 bg-arcane-15/30 border-arcane-30';
      default: return 'text-text-secondary bg-midnight-elevated border-divider';
    }
  };

  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Award className="mr-2 h-5 w-5 text-achievement" />
          Achievement List
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input
              placeholder="Search achievements..."
              className="bg-midnight-elevated border-divider pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-44">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-midnight-elevated border-divider">
                  <Filter className="h-4 w-4 mr-2 text-text-tertiary" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-32">
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="bg-midnight-elevated border-divider">
                  <SelectValue placeholder="Rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranks</SelectItem>
                  <SelectItem value="S">Rank S</SelectItem>
                  <SelectItem value="A">Rank A</SelectItem>
                  <SelectItem value="B">Rank B</SelectItem>
                  <SelectItem value="C">Rank C</SelectItem>
                  <SelectItem value="D">Rank D</SelectItem>
                  <SelectItem value="E">Rank E</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="rounded-md border border-divider/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-midnight-elevated">
              <TableRow>
                <TableHead className="text-text-primary font-orbitron">Name</TableHead>
                <TableHead className="text-text-primary font-orbitron">Description</TableHead>
                <TableHead className="text-text-primary font-orbitron">Requirement</TableHead>
                <TableHead className="text-text-primary font-orbitron w-24">Reward</TableHead>
                <TableHead className="text-text-primary font-orbitron w-20 text-center">Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                      Loading achievements...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAchievements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-text-secondary">
                    No achievements found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAchievements.map((achievement) => (
                  <TableRow key={achievement.id} className="border-b border-divider/20">
                    <TableCell className="font-medium text-text-primary">
                      <div className="flex flex-col">
                        <span>{achievement.name}</span>
                        <span className="text-xs text-text-tertiary">{achievement.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {achievement.description}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatRequirements(achievement.requirements)}
                    </TableCell>
                    <TableCell>
                      <span className="text-arcane font-space">+{achievement.xp_reward} XP</span>
                      <br />
                      <span className="text-xs text-text-tertiary">{achievement.points} points</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${getRankColor(achievement.rank)}`}>
                        {achievement.rank}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsList;
