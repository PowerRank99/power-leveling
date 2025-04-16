
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Flame, Users, Award, BookOpen, Target, Zap, Medal, Trophy, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import AchievementGrid from '@/components/achievements/AchievementGrid';
import AchievementStats from '@/components/achievements/AchievementStats';
import AchievementSearch from '@/components/achievements/AchievementSearch';

// Achievement item interface
interface AchievementItem {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: React.ReactNode;
  iconBg: string;
  status: 'locked' | 'unlocked';
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Enhanced mock achievements data
  const achievements: AchievementItem[] = [
    // Treino category
    {
      id: 'first_workout',
      title: 'Primeiro Treino',
      description: 'Complete seu primeiro treino',
      xpReward: 50,
      icon: <Dumbbell className="h-6 w-6 text-arcane" />,
      iconBg: 'bg-arcane-15',
      status: 'unlocked',
      category: 'treino',
      rarity: 'common'
    },
    {
      id: 'streak_7',
      title: 'Chama do Iniciante',
      description: 'Complete 7 treinos seguidos',
      xpReward: 75,
      icon: <Flame className="h-6 w-6 text-valor" />,
      iconBg: 'bg-valor-15',
      status: 'unlocked',
      category: 'treino',
      rarity: 'uncommon'
    },
    {
      id: 'streak_30',
      title: 'Mestre do Fogo',
      description: 'Complete 30 treinos seguidos',
      xpReward: 150,
      icon: <Flame className="h-6 w-6 text-valor" />,
      iconBg: 'bg-valor-15',
      status: 'locked',
      category: 'treino',
      rarity: 'rare'
    },
    {
      id: 'workout_50',
      title: 'Meio Centenário',
      description: 'Complete 50 treinos no total',
      xpReward: 100,
      icon: <Target className="h-6 w-6 text-arcane" />,
      iconBg: 'bg-arcane-15',
      status: 'locked',
      category: 'treino',
      rarity: 'uncommon'
    },
    {
      id: 'workout_100',
      title: 'Centenário',
      description: 'Complete 100 treinos no total',
      xpReward: 200,
      icon: <Target className="h-6 w-6 text-arcane-60" />,
      iconBg: 'bg-arcane-15',
      status: 'locked',
      category: 'treino',
      rarity: 'epic'
    },
    
    // Guildas category
    {
      id: 'first_guild',
      title: 'Primeira Guilda',
      description: 'Entre em sua primeira guilda',
      xpReward: 75,
      icon: <Users className="h-6 w-6 text-arcane" />,
      iconBg: 'bg-arcane-15',
      status: 'unlocked',
      category: 'guildas',
      rarity: 'common'
    },
    {
      id: 'guild_leader',
      title: 'Líder Supremo',
      description: 'Crie uma guilda com 50+ membros',
      xpReward: 300,
      icon: <Trophy className="h-6 w-6 text-achievement" />,
      iconBg: 'bg-achievement-15',
      status: 'locked',
      category: 'guildas',
      rarity: 'legendary'
    },
    {
      id: 'guild_quest_10',
      title: 'Cumpridor de Missões',
      description: 'Complete 10 missões da guilda',
      xpReward: 100,
      icon: <BookOpen className="h-6 w-6 text-arcane" />,
      iconBg: 'bg-arcane-15',
      status: 'locked',
      category: 'guildas',
      rarity: 'uncommon'
    },
    
    // Social category
    {
      id: 'first_friend',
      title: 'Socialite',
      description: 'Adicione seu primeiro amigo',
      xpReward: 50,
      icon: <Users className="h-6 w-6 text-arcane" />,
      iconBg: 'bg-arcane-15',
      status: 'unlocked',
      category: 'social',
      rarity: 'common'
    },
    {
      id: 'popular',
      title: 'Popular',
      description: 'Tenha 20 amigos na plataforma',
      xpReward: 150,
      icon: <Users className="h-6 w-6 text-arcane" />,
      iconBg: 'bg-arcane-15',
      status: 'locked',
      category: 'social',
      rarity: 'rare'
    },
    
    // Desafios category
    {
      id: 'first_challenge',
      title: 'Desafiante',
      description: 'Complete seu primeiro desafio',
      xpReward: 100,
      icon: <Zap className="h-6 w-6 text-achievement" />,
      iconBg: 'bg-achievement-15',
      status: 'unlocked',
      category: 'desafios',
      rarity: 'uncommon'
    },
    {
      id: 'challenge_master',
      title: 'Mestre dos Desafios',
      description: 'Complete 50 desafios',
      xpReward: 300,
      icon: <Medal className="h-6 w-6 text-achievement" />,
      iconBg: 'bg-achievement-15',
      status: 'locked',
      category: 'desafios',
      rarity: 'legendary'
    },
    
    // Tempo category
    {
      id: 'one_month',
      title: 'Um Mês na Jornada',
      description: 'Complete 1 mês usando o aplicativo',
      xpReward: 50,
      icon: <Clock className="h-6 w-6 text-arcane" />,
      iconBg: 'bg-arcane-15',
      status: 'unlocked',
      category: 'tempo',
      rarity: 'common'
    },
    {
      id: 'one_year',
      title: 'Um Ano de Evolução',
      description: 'Complete 1 ano usando o aplicativo',
      xpReward: 500,
      icon: <Award className="h-6 w-6 text-achievement" />,
      iconBg: 'bg-achievement-15',
      status: 'locked',
      category: 'tempo',
      rarity: 'epic'
    }
  ];
  
  // Filter achievements based on selected filter and search term
  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      // Filter by status
      if (filter !== 'all' && achievement.status !== filter) return false;
      
      // Filter by search term
      if (searchTerm && !achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
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
    const categories = {
      treino: filteredAchievements.filter(a => a.category === 'treino'),
      guildas: filteredAchievements.filter(a => a.category === 'guildas'),
      social: filteredAchievements.filter(a => a.category === 'social'),
      desafios: filteredAchievements.filter(a => a.category === 'desafios'),
      tempo: filteredAchievements.filter(a => a.category === 'tempo')
    };
    
    return categories;
  }, [filteredAchievements]);
  
  // Count achievements stats
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.status === 'unlocked').length;
  
  return (
    <div className="pb-20 min-h-screen bg-midnight-base">
      <PageHeader 
        title="Conquistas" 
        showBackButton={true}
      />
      
      <div className="px-4 pt-2 pb-4">
        {/* Achievement Stats */}
        <AchievementStats 
          totalCount={totalAchievements}
          unlockedCount={unlockedAchievements}
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
        
        {/* Empty state when no achievements match filters */}
        {filteredAchievements.length === 0 && (
          <div className="premium-card p-8 text-center">
            <Award className="h-12 w-12 text-text-tertiary mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-text-primary font-orbitron">Nenhuma conquista encontrada</h3>
            <p className="text-text-secondary mt-1 font-sora">
              Tente ajustar seus filtros ou termos de busca
            </p>
          </div>
        )}
        
        {/* Achievement grids by category */}
        {activeCategory === 'all' ? (
          <>
            {Object.entries(achievementsByCategory).map(([category, items]) => 
              items.length > 0 && (
                <AchievementGrid 
                  key={category} 
                  achievements={items} 
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                />
              )
            )}
          </>
        ) : (
          <>
            {filteredAchievements.length > 0 && (
              <AchievementGrid 
                achievements={filteredAchievements}
                title={activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
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
