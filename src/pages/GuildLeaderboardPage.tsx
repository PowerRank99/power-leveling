
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Share2, Shield, Users, Trophy, Calendar, TrendingUp } from 'lucide-react';
import LeaderboardPodium from '@/components/guilds/LeaderboardPodium';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Import the components
import GuildHeader from '@/components/guilds/GuildHeader';
import GuildStats from '@/components/guilds/GuildStats';
import LeaderboardFilters from '@/components/guilds/LeaderboardFilters';
import MembersList from '@/components/guilds/MembersList';
import MemberRankingList from '@/components/guilds/MemberRankingList';

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

const GuildLeaderboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [metricFilter, setMetricFilter] = useState('xp');
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
  
  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mock data for initial UI
  const guildInfo = {
    name: "Guerreiros do Fitness",
    avatar: "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
    memberCount: 32,
    activeMemberCount: 28,
    totalExp: 15750,
    weeklyExp: 1250,
    completedQuests: 24,
    activeQuests: 2,
    isUserGuildMaster: true
  };
  
  const pixelAvatar1 = "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png";
  const pixelAvatar2 = "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png";
  const pixelAvatar3 = "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png";
  const pixelAvatar4 = "/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png";
  const pixelAvatar5 = "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png";
  
  const topMembers: Member[] = [
    { id: "1", name: "Você", avatar: pixelAvatar1, points: 1250, position: 1, isCurrentUser: true, badge: "Mestre da Guilda", trend: "up" },
    { id: "2", name: "João Silva", avatar: pixelAvatar2, points: 1100, position: 2, trend: "down" },
    { id: "3", name: "Maria Santos", avatar: pixelAvatar3, points: 950, position: 3, trend: "same" }
  ];
  
  const allMembers: Member[] = [
    ...topMembers,
    { id: "4", name: "Carlos Oliveira", avatar: pixelAvatar4, points: 820, position: 4, trend: "down" },
    { id: "5", name: "Ana Costa", avatar: pixelAvatar5, points: 790, position: 5, trend: "up" },
    { id: "6", name: "Pedro Souza", avatar: pixelAvatar4, points: 730, position: 6, trend: "same" },
    { id: "7", name: "Lúcia Ferreira", avatar: pixelAvatar3, points: 690, position: 7, badge: "Moderadora", trend: "up" },
    { id: "8", name: "Ricardo Santos", avatar: pixelAvatar2, points: 640, position: 8, trend: "down" },
    { id: "9", name: "Beatriz Lima", avatar: pixelAvatar5, points: 590, position: 9, trend: "up" }
  ];
  
  const handleShareRanking = () => {
    navigator.clipboard.writeText(`Confira a classificação da guilda Guerreiros do Fitness! Junte-se a nós no PowerLeveling!`);
    
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
  
  // Stat cards data
  const statCards = [
    { title: "XP Total", value: guildInfo.totalExp, icon: <Trophy className="text-achievement" /> },
    { title: "XP Semanal", value: guildInfo.weeklyExp, icon: <TrendingUp className="text-arcane" /> },
    { title: "Membros Ativos", value: `${guildInfo.activeMemberCount}/${guildInfo.memberCount}`, icon: <Users className="text-text-secondary" /> },
    { title: "Missões", value: guildInfo.activeQuests, icon: <Calendar className="text-valor" /> },
  ];
  
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                <span className="text-xs font-space text-text-tertiary">Nível 15</span>
              </div>
              <Progress value={65} pulsateIndicator className="h-2 mb-1" />
              <div className="flex justify-between text-xs text-text-tertiary">
                <span className="font-space">9,750 XP</span>
                <span className="font-space">15,000 XP</span>
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
        
        {/* Podium Component */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <LeaderboardPodium members={topMembers} />
          </Card>
        </motion.div>
        
        {/* Members List Component */}
        <motion.div variants={itemVariants}>
          <Card>
            <MembersList members={allMembers} />
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
