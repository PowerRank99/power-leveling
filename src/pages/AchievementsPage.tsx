
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Flame, Users, Award, BookOpen, Target, Zap, Medal, Trophy, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import AchievementGrid from '@/components/achievements/AchievementGrid';
import AchievementStats from '@/components/achievements/AchievementStats';
import AchievementSearch from '@/components/achievements/AchievementSearch';
import { Achievement } from '@/types/achievementTypes';
import { AchievementService } from '@/services/rpg/AchievementService';

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unlocked: 0 });
  
  // Fetch achievements on component mount
  useEffect(() => {
    const fetchAchievements = async () => {
      if (profile?.id) {
        setIsLoading(true);
        
        try {
          // Fetch achievements from the service
          const data = await AchievementService.getAchievements(profile.id);
          setAchievements(data);
          
          // Fetch achievement stats
          const achievementStats = await AchievementService.getAchievementStats(profile.id);
          setStats({
            total: achievementStats.total,
            unlocked: achievementStats.unlocked
          });
        } catch (error) {
          console.error('Error fetching achievements:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchAchievements();
  }, [profile?.id]);
  
  // Filter achievements based on selected filter and search term
  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      // Filter by status
      if (filter === 'unlocked' && !achievement.isUnlocked) return false;
      if (filter === 'locked' && achievement.isUnlocked) return false;
      
      // Filter by search term
      if (searchTerm && !achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (activeCategory !== 'all' && achievement.category !== activeCategory) return false;
      
      return true;
    });
  }, [achievements, filter, searchTerm, activeCategory]);
  
  // Group achievements by category for display
  const achievementsByCategory = useMemo(() => {
    const categories: Record<string, Achievement[]> = {};
    
    filteredAchievements.forEach(achievement => {
      const category = achievement.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(achievement);
    });
    
    return categories;
  }, [filteredAchievements]);
  
  // Handle achievement click
  const handleAchievementClick = (achievement: Achievement) => {
    // Show achievement details or progress
    console.log('Achievement clicked:', achievement);
    // Could implement a modal or detail view here
  };
  
  return (
    <div className="pb-20 min-h-screen bg-midnight-base">
      <PageHeader 
        title="Conquistas" 
        showBackButton={true}
      />
      
      <div className="px-4 pt-2 pb-4">
        {/* Achievement Stats */}
        <AchievementStats 
          totalCount={stats.total}
          unlockedCount={stats.unlocked}
        />
        
        {/* Search */}
        <AchievementSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        {/* Filter Tabs */}
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
        
        {/* Category Tabs */}
        <div className="premium-card mb-4 overflow-x-auto p-2">
          <div className="flex min-w-max">
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-sora ${
                activeCategory === 'all' 
                  ? 'bg-arcane text-text-primary shadow-glow-purple' 
                  : 'bg-midnight-elevated text-text-secondary hover:bg-midnight-card'
              }`}
              onClick={() => setActiveCategory('all')}
            >
              Todas Categorias
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm ml-2 whitespace-nowrap font-sora ${
                activeCategory === 'treino' 
                  ? 'bg-arcane text-text-primary shadow-glow-purple' 
                  : 'bg-midnight-elevated text-text-secondary hover:bg-midnight-card'
              }`}
              onClick={() => setActiveCategory('treino')}
            >
              <Dumbbell className="h-4 w-4 inline mr-1" />
              Treino
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm ml-2 whitespace-nowrap font-sora ${
                activeCategory === 'guildas' 
                  ? 'bg-arcane text-text-primary shadow-glow-purple' 
                  : 'bg-midnight-elevated text-text-secondary hover:bg-midnight-card'
              }`}
              onClick={() => setActiveCategory('guildas')}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Guildas
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm ml-2 whitespace-nowrap font-sora ${
                activeCategory === 'social' 
                  ? 'bg-arcane text-text-primary shadow-glow-purple' 
                  : 'bg-midnight-elevated text-text-secondary hover:bg-midnight-card'
              }`}
              onClick={() => setActiveCategory('social')}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Social
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm ml-2 whitespace-nowrap font-sora ${
                activeCategory === 'desafios' 
                  ? 'bg-arcane text-text-primary shadow-glow-purple' 
                  : 'bg-midnight-elevated text-text-secondary hover:bg-midnight-card'
              }`}
              onClick={() => setActiveCategory('desafios')}
            >
              <Zap className="h-4 w-4 inline mr-1" />
              Desafios
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm ml-2 whitespace-nowrap font-sora ${
                activeCategory === 'tempo' 
                  ? 'bg-arcane text-text-primary shadow-glow-purple' 
                  : 'bg-midnight-elevated text-text-secondary hover:bg-midnight-card'
              }`}
              onClick={() => setActiveCategory('tempo')}
            >
              <Clock className="h-4 w-4 inline mr-1" />
              Tempo
            </button>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="premium-card p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-midnight-elevated h-12 w-12 mb-4"></div>
              <div className="h-4 bg-midnight-elevated rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-midnight-elevated rounded w-1/2"></div>
            </div>
          </div>
        )}
        
        {/* Empty state when no achievements match filters */}
        {!isLoading && filteredAchievements.length === 0 && (
          <div className="premium-card p-8 text-center">
            <Award className="h-12 w-12 text-text-tertiary mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-text-primary font-orbitron">Nenhuma conquista encontrada</h3>
            <p className="text-text-secondary mt-1 font-sora">
              Tente ajustar seus filtros ou termos de busca
            </p>
          </div>
        )}
        
        {/* Achievement grids by category */}
        {!isLoading && activeCategory === 'all' ? (
          <>
            {Object.entries(achievementsByCategory).map(([category, items]) => 
              items.length > 0 && (
                <AchievementGrid 
                  key={category} 
                  achievements={items} 
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                  onAchievementClick={handleAchievementClick}
                />
              )
            )}
          </>
        ) : (
          <>
            {!isLoading && filteredAchievements.length > 0 && (
              <AchievementGrid 
                achievements={filteredAchievements}
                title={activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                onAchievementClick={handleAchievementClick}
              />
            )}
          </>
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default AchievementsPage;
