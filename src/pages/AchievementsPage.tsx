
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, HelpCircle, Calendar, Star, ChevronUp, ChevronDown, Crown } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import RankBadge from '@/components/achievements/RankBadge';
import { Achievement } from '@/types/achievementTypes';
import { AchievementService } from '@/services/rpg/AchievementService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ranks = ['S', 'A', 'B', 'C', 'D', 'E'] as const;

const AchievementsPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, points: 0, totalXp: 0 });
  const [expandedRank, setExpandedRank] = useState<string | null>('S');
  const [showHint, setShowHint] = useState(false);

  // Fetch achievements on component mount
  useEffect(() => {
    const fetchAchievements = async () => {
      if (profile?.id) {
        setIsLoading(true);
        
        try {
          // Only fetch unlocked achievements
          const data = await AchievementService.getUnlockedAchievements(profile.id);
          setAchievements(data);
          
          // Fetch achievement stats
          const achievementStats = await AchievementService.getAchievementStats(profile.id);
          setStats({
            total: achievementStats.total,
            unlocked: achievementStats.unlocked,
            points: achievementStats.points,
            totalXp: data.reduce((sum, a) => sum + a.xpReward, 0)
          });

          // Play sound based on highest rank if they have achievements
          if (data.length > 0) {
            playAchievementSound(getHighestRank(data));
          }
        } catch (error) {
          console.error('Error fetching achievements:', error);
          toast({
            title: "Erro ao carregar conquistas",
            description: "Não foi possível carregar suas conquistas",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchAchievements();
  }, [profile?.id, toast]);
  
  // Get highest rank from achievements
  const getHighestRank = (achievements: Achievement[]): string => {
    for (const rank of ranks) {
      if (achievements.some(a => a.rank === rank)) {
        return rank;
      }
    }
    return 'E';
  };
  
  // Play sound based on rank
  const playAchievementSound = (rank: string) => {
    // This would be implemented with actual sound effects
    console.log(`Playing ${rank} rank sound effect`);
  };
  
  // Group achievements by rank
  const achievementsByRank = useCallback(() => {
    const grouped: Record<string, Achievement[]> = {};
    
    ranks.forEach(rank => {
      const rankAchievements = achievements.filter(a => a.rank === rank);
      if (rankAchievements.length > 0) {
        grouped[rank] = rankAchievements;
      }
    });
    
    return grouped;
  }, [achievements]);
  
  // Get rank color class for styling
  const getRankColorClass = (rank: string) => {
    switch(rank) {
      case 'S': return 'bg-gradient-to-r from-achievement to-achievement-60 text-text-primary shadow-glow-gold';
      case 'A': return 'bg-achievement-15 text-achievement border-achievement-30';
      case 'B': return 'bg-valor-15 text-valor border-valor-30';
      case 'C': return 'bg-arcane-15 text-arcane-60 border-arcane-30';
      case 'D': return 'bg-arcane-15 text-arcane border-arcane-30';
      case 'E': return 'bg-midnight-elevated text-text-secondary border-divider/30';
      default: return 'bg-midnight-elevated text-text-tertiary border-divider/30';
    }
  };
  
  // Get icon background class based on rank
  const getIconBgClass = (rank: string) => {
    switch(rank) {
      case 'S': return 'bg-achievement-15 text-achievement shadow-glow-gold';
      case 'A': return 'bg-achievement-15 text-achievement shadow-glow-gold';
      case 'B': return 'bg-valor-15 text-valor shadow-glow-valor';
      case 'C': return 'bg-arcane-15 text-arcane-60 shadow-glow-purple';
      case 'D': return 'bg-arcane-15 text-arcane shadow-glow-subtle';
      case 'E': return 'bg-midnight-elevated text-text-secondary';
      default: return 'bg-midnight-elevated text-text-tertiary';
    }
  };
  
  // Get animation settings based on rank
  const getAnimationSettings = (rank: string) => {
    switch(rank) {
      case 'S': return { delay: 0.05, duration: 0.7, type: 'spring', stiffness: 300 };
      case 'A': return { delay: 0.04, duration: 0.6, type: 'spring', stiffness: 250 };
      case 'B': return { delay: 0.03, duration: 0.5, type: 'spring', stiffness: 200 };
      default: return { delay: 0.02, duration: 0.4, type: 'spring', stiffness: 150 };
    }
  };
  
  // Toggles a rank section open/closed
  const toggleRank = (rank: string) => {
    setExpandedRank(expandedRank === rank ? null : rank);
  };
  
  // Random hints for different achievement types
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
  
  // Handler for hint button
  const handleHintClick = () => {
    setShowHint(true);
    toast({
      title: "Dica misteriosa",
      description: getRandomHint(),
      duration: 5000,
    });
    
    // Hide hint after 5 seconds
    setTimeout(() => setShowHint(false), 5000);
  };
  
  // Render achievement icon
  const renderAchievementIcon = (iconName: string, rank: string) => {
    // This would be expanded with more icons based on the achievement type
    return (
      <Award className={`h-6 w-6 ${rank === 'S' || rank === 'A' ? 'text-achievement' : 
        rank === 'B' ? 'text-valor' : 'text-arcane'}`} />
    );
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
        {/* Achievement Stats */}
        <motion.div 
          className="premium-card mb-6 bg-midnight-card border border-divider/30 shadow-glow-subtle overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4 border-b border-divider/30">
            <h3 className="text-lg font-orbitron font-bold text-text-primary">Poder Revelado</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary font-sora">Conquistas Reveladas</span>
              <span className="font-space text-arcane font-bold">{stats.unlocked}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary font-sora">Pontos de Conquista</span>
              <div className="flex items-center">
                <span className="font-space text-achievement font-bold mr-1">{stats.points}</span>
                <Star className="h-4 w-4 text-achievement" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary font-sora">XP Total Ganho</span>
              <span className="font-space text-arcane font-bold">+{stats.totalXp} XP</span>
            </div>
            <div className="mt-2 text-xs text-text-tertiary font-sora italic">
              "Suas conquistas são apenas uma parte do seu verdadeiro potencial..."
            </div>
          </div>
        </motion.div>
        
        {/* Loading state */}
        {isLoading && (
          <motion.div 
            className="premium-card p-8 text-center bg-midnight-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-midnight-elevated h-12 w-12 mb-4"></div>
              <div className="h-4 bg-midnight-elevated rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-midnight-elevated rounded w-1/2"></div>
            </div>
          </motion.div>
        )}
        
        {/* Empty state when no achievements */}
        {!isLoading && achievements.length === 0 && (
          <motion.div 
            className="premium-card p-8 text-center bg-midnight-card border border-divider/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Award className="h-16 w-16 text-text-tertiary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-text-primary font-orbitron mb-2">Mistérios Não Revelados</h3>
            <p className="text-text-secondary mt-1 font-sora max-w-sm mx-auto">
              "Conquistas serão reveladas conforme sua jornada avança. Continue seu caminho para descobrir seu potencial oculto."
            </p>
            <motion.button 
              className="mt-6 px-4 py-2 bg-midnight-elevated rounded-full text-text-secondary font-sora text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHintClick}
            >
              Receber uma dica misteriosa
            </motion.button>
          </motion.div>
        )}
        
        {/* Achievement sections by rank */}
        {!isLoading && Object.entries(achievementsByRank()).map(([rank, items]) => (
          <motion.div 
            key={rank}
            className="premium-card mb-4 bg-midnight-card border border-divider/30 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: ranks.indexOf(rank as any) * 0.1 }}
          >
            {/* Rank header */}
            <motion.div 
              className={`p-4 flex justify-between items-center cursor-pointer ${getRankColorClass(rank)}`}
              onClick={() => toggleRank(rank)}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center">
                <RankBadge rank={rank as any} size="lg" />
                <h3 className="ml-3 font-orbitron font-bold text-lg">
                  {rank === 'S' ? 'Conquistas Lendárias' :
                   rank === 'A' ? 'Conquistas Raras' :
                   rank === 'B' ? 'Conquistas Notáveis' :
                   rank === 'C' ? 'Conquistas Importantes' :
                   rank === 'D' ? 'Conquistas Significativas' :
                   'Conquistas Iniciais'}
                </h3>
              </div>
              {expandedRank === rank ? 
                <ChevronUp className="h-5 w-5" /> : 
                <ChevronDown className="h-5 w-5" />
              }
            </motion.div>
            
            {/* Achievement items */}
            <AnimatePresence>
              {expandedRank === rank && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    {items.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        className={`p-4 border ${
                          rank === 'S' || rank === 'A' ? 'border-achievement-30' : 
                          rank === 'B' ? 'border-valor-30' : 'border-arcane-30'
                        } rounded-lg bg-midnight-elevated overflow-hidden`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * getAnimationSettings(rank).delay,
                          duration: getAnimationSettings(rank).duration,
                          type: getAnimationSettings(rank).type as any,
                          stiffness: getAnimationSettings(rank).stiffness
                        }}
                      >
                        <div className="flex items-start">
                          {/* Icon */}
                          <div className={`${getIconBgClass(rank)} rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0`}>
                            {renderAchievementIcon(achievement.iconName, rank)}
                          </div>
                          
                          {/* Content */}
                          <div className="ml-4 flex-1">
                            <h4 className="font-orbitron font-bold text-text-primary">{achievement.name}</h4>
                            <p className="text-sm text-text-secondary mt-1 font-sora">{achievement.description}</p>
                            
                            {/* Achievement date */}
                            {achievement.achievedAt && (
                              <div className="flex items-center mt-2 text-xs text-text-tertiary">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Revelado em {format(parseISO(achievement.achievedAt), "dd 'de' MMMM", { locale: ptBR })}</span>
                              </div>
                            )}
                            
                            {/* Reward */}
                            <div className="flex justify-between items-center mt-3">
                              <Badge 
                                className={rank === 'S' || rank === 'A' 
                                  ? 'bg-achievement-15 text-achievement border-achievement-30' 
                                  : rank === 'B' 
                                    ? 'bg-valor-15 text-valor border-valor-30'
                                    : 'bg-arcane-15 text-arcane border-arcane-30'
                                }
                              >
                                +{achievement.xpReward} XP
                              </Badge>
                              
                              <div className="flex items-center">
                                <span className={`text-sm font-medium ${
                                  rank === 'S' || rank === 'A' ? 'text-achievement' : 
                                  rank === 'B' ? 'text-valor' : 'text-arcane'
                                }`}>
                                  {achievement.points}
                                </span>
                                <Star className={`h-3 w-3 ml-1 ${
                                  rank === 'S' || rank === 'A' ? 'text-achievement' : 
                                  rank === 'B' ? 'text-valor' : 'text-arcane'
                                }`} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        
        {/* Mysterious message at the bottom */}
        {!isLoading && achievements.length > 0 && (
          <motion.div 
            className="text-center mt-8 mb-4 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <p className="text-text-tertiary italic font-sora text-sm">
              "Muitas conquistas ainda permanecem ocultas, aguardando para serem reveladas..."
            </p>
          </motion.div>
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default AchievementsPage;
