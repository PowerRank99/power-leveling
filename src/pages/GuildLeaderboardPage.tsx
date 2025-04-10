
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Share2, Shield } from 'lucide-react';
import LeaderboardPodium from '@/components/guilds/LeaderboardPodium';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import the components
import GuildHeader from '@/components/guilds/GuildHeader';
import GuildStats from '@/components/guilds/GuildStats';
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

const GuildLeaderboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [metricFilter, setMetricFilter] = useState('xp');
  const navigate = useNavigate();
  
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
    { id: "1", name: "Você", avatar: pixelAvatar1, points: 1250, position: 1, isCurrentUser: true, badge: "Mestre da Guilda" },
    { id: "2", name: "João Silva", avatar: pixelAvatar2, points: 1100, position: 2 },
    { id: "3", name: "Maria Santos", avatar: pixelAvatar3, points: 950, position: 3 }
  ];
  
  const allMembers: Member[] = [
    ...topMembers,
    { id: "4", name: "Carlos Oliveira", avatar: pixelAvatar4, points: 820, position: 4 },
    { id: "5", name: "Ana Costa", avatar: pixelAvatar5, points: 790, position: 5 },
    { id: "6", name: "Pedro Souza", avatar: pixelAvatar4, points: 730, position: 6 },
    { id: "7", name: "Lúcia Ferreira", avatar: pixelAvatar3, points: 690, position: 7, badge: "Moderadora" },
    { id: "8", name: "Ricardo Santos", avatar: pixelAvatar2, points: 640, position: 8 },
    { id: "9", name: "Beatriz Lima", avatar: pixelAvatar5, points: 590, position: 9 }
  ];
  
  const handleShareRanking = () => {
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
        <LoadingSpinner message="Carregando classificação..." />
        <BottomNavBar />
      </div>
    );
  }
  
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
            className="text-text-secondary hover:text-text-primary"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        }
      />
      
      <div className="space-y-4 p-4">
        {/* Guild Header Component */}
        <div className="premium-card p-4 shadow-subtle bg-gradient-to-r from-arcane-15 to-arcane-30 border-arcane-30">
          <GuildHeader guildInfo={guildInfo} guildId={id || '1'} />
        </div>
        
        {/* Guild Stats Component */}
        <div className="premium-card p-4 shadow-subtle">
          <GuildStats 
            weeklyExp={guildInfo.weeklyExp}
            totalExp={guildInfo.totalExp}
            activeMemberCount={guildInfo.activeMemberCount}
            memberCount={guildInfo.memberCount}
            activeQuests={guildInfo.activeQuests}
          />
        </div>
        
        {/* Leaderboard Filters Component */}
        <div className="premium-card shadow-subtle overflow-hidden">
          <LeaderboardFilters 
            timeFilter={timeFilter}
            metricFilter={metricFilter}
            onTimeFilterChange={setTimeFilter}
            onMetricFilterChange={setMetricFilter}
          />
        </div>
        
        {/* Podium Component */}
        <div className="premium-card shadow-subtle overflow-hidden">
          <LeaderboardPodium members={topMembers} />
        </div>
        
        {/* Members List Component */}
        <div className="premium-card p-4 shadow-subtle">
          <h3 className="text-lg font-orbitron font-bold mb-3 text-text-primary">Todos os Membros</h3>
          <MemberRankingList members={allMembers} />
        </div>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildLeaderboardPage;
