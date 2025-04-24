
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Share2, Shield, Users, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GuildService } from '@/services/rpg/guild/GuildService';
import { useAuth } from '@/hooks/useAuth';

// Import the components
import GuildHeader from '@/components/guilds/GuildHeader';
import LeaderboardFilters from '@/components/guilds/LeaderboardFilters';
import MembersList from '@/components/guilds/MembersList';

// Define a consistent Member interface to avoid type issues
interface Member {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
  badge?: string;
  trend?: 'up' | 'down' | 'same';
}

interface GuildInfo {
  name: string;
  avatar: string;
  memberCount: number;
  activeMemberCount: number;
  totalExp: number;
  weeklyExp: number;
  completedQuests: number;
  activeQuests: number;
  isUserGuildMaster: boolean;
}

const GuildLeaderboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [metricFilter, setMetricFilter] = useState('xp');
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const navigate = useNavigate();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };
  
  // Calculate guild level based on XP
  const calculateGuildLevel = (totalXp: number): number => {
    if (totalXp <= 0) return 1;
    return Math.max(1, Math.floor(totalXp / 1000) + 1);
  };
  
  // Calculate next level XP
  const calculateNextLevelXP = (totalXp: number): { current: number, next: number, percent: number } => {
    const currentLevel = calculateGuildLevel(totalXp);
    const nextLevelXP = currentLevel * 1000;
    const prevLevelXP = (currentLevel - 1) * 1000;
    const levelProgress = totalXp - prevLevelXP;
    const levelRange = nextLevelXP - prevLevelXP;
    const percent = Math.round((levelProgress / levelRange) * 100);
    
    return {
      current: levelProgress,
      next: levelRange,
      percent: percent
    };
  };
  
  useEffect(() => {
    const fetchGuildData = async () => {
      if (!id) {
        setError("ID da guilda não especificado");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch guild details
        const guildDetails = await GuildService.getGuildDetails(id);
        if (!guildDetails) {
          setError("Guilda não encontrada");
          setLoading(false);
          return;
        }
        
        // Fetch guild members leaderboard
        const leaderboardData = await GuildService.getLeaderboard(id, timeFilter, metricFilter);
        const leaderboardMembers: Member[] = Array.isArray(leaderboardData) 
          ? leaderboardData.map((member, index) => ({
              id: member.user_id,
              name: member.name || 'Membro',
              avatar: member.avatar_url || "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
              points: member.total_xp || 0,
              position: index + 1,
              isCurrentUser: member.user_id === user?.id,
              badge: member.role === 'guild_master' ? 'Mestre da Guilda' : 
                     member.role === 'moderator' ? 'Moderador' : undefined,
              trend: 'same' // We don't have historical data for trend
            }))
          : [];
        
        // Create guild info object
        const guildInfoData: GuildInfo = {
          name: guildDetails.name,
          avatar: guildDetails.avatar_url || "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
          memberCount: guildDetails.memberCount || 0,
          activeMemberCount: Math.floor((guildDetails.memberCount || 0) * 0.8), // Assume 80% active as a placeholder
          totalExp: guildDetails.total_xp || 0,
          weeklyExp: 0, // We don't have this data yet
          completedQuests: 0, // Placeholder
          activeQuests: guildDetails.activeRaidsCount || 0,
          isUserGuildMaster: false // Will update below
        };
        
        // Check if user is guild master
        const userGuilds = user?.id ? await GuildService.getUserGuilds(user.id) : [];
        const userGuild = userGuilds.find(g => g.id === id);
        if (userGuild) {
          guildInfoData.isUserGuildMaster = userGuild.role === 'guild_master';
        }
        
        setGuildInfo(guildInfoData);
        setMembers(leaderboardMembers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching guild data:", error);
        setError("Erro ao carregar dados da guilda");
        setLoading(false);
      }
    };
    
    fetchGuildData();
  }, [id, user?.id, timeFilter, metricFilter]);
  
  const handleShareRanking = () => {
    if (!guildInfo) return;
    
    navigator.clipboard.writeText(
      `Confira a classificação da guilda ${guildInfo.name}! Junte-se a nós no PowerLeveling!`
    );
    
    toast.success('Link copiado!', {
      description: 'Link do ranking copiado para a área de transferência.'
    });
  };
  
  const handleQuestsClick = () => {
    navigate(`/guilds/${id}/quests`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-base pb-16">
        <PageHeader title="Classificação da Guilda" />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <LoadingSpinner 
            message="Carregando classificação..." 
            subMessage="Buscando dados da guilda e membros" 
            size="lg"
          />
        </div>
        <BottomNavBar />
      </div>
    );
  }
  
  if (error || !guildInfo) {
    return (
      <div className="min-h-screen bg-midnight-base pb-16">
        <PageHeader title="Classificação da Guilda" showBackButton={true} />
        <div className="flex flex-col items-center justify-center h-[50vh] p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-orbitron text-text-primary">Guilda não encontrada</h2>
            <p className="text-text-secondary font-sora">
              {error || "Não foi possível encontrar a guilda solicitada."}
            </p>
            <Button 
              onClick={() => navigate('/guilds')} 
              variant="arcane"
            >
              Voltar para Lista de Guildas
            </Button>
          </div>
        </div>
        <BottomNavBar />
      </div>
    );
  }
  
  // Stat cards data for the remaining Membros Ativos and Missões cards
  const statCards = [
    { title: "Membros Ativos", value: `${guildInfo.activeMemberCount}/${guildInfo.memberCount}`, icon: <Users className="text-text-secondary" /> },
    { title: "Missões", value: guildInfo.activeQuests, icon: <Calendar className="text-valor" /> },
  ];
  
  // Calculate guild XP progress
  const xpProgress = calculateNextLevelXP(guildInfo.totalExp);
  
  return (
    <div className="min-h-screen bg-midnight-base pb-16">
      <PageHeader 
        title="Classificação da Guilda" 
        showBackButton={true}
        rightContent={
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShareRanking}
            className="text-text-secondary hover:text-text-primary transition-colors relative overflow-hidden"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        }
      />
      
      <motion.div 
        className="space-y-4 p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Guild Header Component */}
        <motion.div variants={itemVariants} className="relative">
          <Card className="bg-gradient-to-r from-arcane-15 to-arcane-30 border-arcane-30 shadow-glow-subtle">
            <CardContent className="p-4">
              <GuildHeader guildInfo={guildInfo} guildId={id || '1'} />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Guild Stats Component - Using a grid layout for stat cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat, index) => (
              <Card key={index} interactive className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-midnight-elevated flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary font-sora">{stat.title}</p>
                      <p className="text-lg font-space font-bold text-text-primary">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
        
        {/* Guild Progress Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-sora text-text-secondary">Progresso da Guilda</span>
                <span className="text-xs font-space text-text-tertiary">Nível {calculateGuildLevel(guildInfo.totalExp)}</span>
              </div>
              <Progress value={xpProgress.percent} pulsateIndicator className="h-2 mb-1" />
              <div className="flex justify-between text-xs text-text-tertiary">
                <span className="font-space">{xpProgress.current} XP</span>
                <span className="font-space">{xpProgress.next} XP</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Leaderboard Filters Component */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <LeaderboardFilters 
              timeFilter={timeFilter}
              metricFilter={metricFilter}
              onTimeFilterChange={setTimeFilter}
              onMetricFilterChange={setMetricFilter}
            />
          </Card>
        </motion.div>
        
        {/* Members List Component */}
        <motion.div variants={itemVariants}>
          <Card>
            <MembersList members={members} />
          </Card>
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex justify-center py-2">
          <Button 
            variant="arcane" 
            onClick={handleQuestsClick}
            className="w-full max-w-sm"
          >
            <Trophy className="mr-1" /> Ver Missões da Guilda
          </Button>
        </motion.div>
      </motion.div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildLeaderboardPage;
