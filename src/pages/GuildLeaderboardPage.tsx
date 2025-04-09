
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UsersIcon, Filter, Crown, Shield, Compass } from 'lucide-react';
import LeaderboardPodium from '@/components/guilds/LeaderboardPodium';
import MemberRankingList from '@/components/guilds/MemberRankingList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GuildLeaderboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [metricFilter, setMetricFilter] = useState('xp');
  
  // Mock data for initial UI
  const guildInfo = {
    name: "Guerreiros do Fitness",
    avatar: "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
    memberCount: 32,
    activeMemberCount: 28,
    level: 5,
    isUserGuildMaster: true
  };
  
  const pixelAvatar1 = "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png";
  const pixelAvatar2 = "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png";
  const pixelAvatar3 = "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png";
  const pixelAvatar4 = "/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png";
  const pixelAvatar5 = "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png";
  
  const topMembers = [
    { id: "1", name: "Você", avatar: pixelAvatar1, points: 1250, position: 1, isCurrentUser: true },
    { id: "2", name: "João Silva", avatar: pixelAvatar2, points: 1100, position: 2 },
    { id: "3", name: "Maria Santos", avatar: pixelAvatar3, points: 950, position: 3 }
  ];
  
  const allMembers = [
    ...topMembers,
    { id: "4", name: "Carlos Oliveira", avatar: pixelAvatar4, points: 820, position: 4 },
    { id: "5", name: "Ana Costa", avatar: pixelAvatar5, points: 790, position: 5 },
    { id: "6", name: "Pedro Souza", avatar: pixelAvatar4, points: 730, position: 6 },
    { id: "7", name: "Lúcia Ferreira", avatar: pixelAvatar3, points: 690, position: 7 },
    { id: "8", name: "Ricardo Santos", avatar: pixelAvatar2, points: 640, position: 8 },
    { id: "9", name: "Beatriz Lima", avatar: pixelAvatar5, points: 590, position: 9 }
  ];
  
  const handleQuestsClick = () => {
    navigate(`/guilds/${id}/quests`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <PageHeader title="Classificação da Guilda" />
        <LoadingSpinner message="Carregando classificação..." />
        <BottomNavBar />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <PageHeader title="Classificação da Guilda" />
      
      {/* Guild Info */}
      <div className="bg-white p-4 flex flex-col border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 shadow-sm border-2 border-gray-100">
            <img src={guildInfo.avatar} alt={guildInfo.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{guildInfo.name}</h2>
            <div className="flex text-sm text-gray-500 mt-1 flex-wrap gap-x-4">
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>{guildInfo.memberCount} membros</span>
              </div>
              <div className="flex items-center">
                <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                <span>Nível {guildInfo.level}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex mt-4 gap-2">
          <Button 
            onClick={handleQuestsClick}
            className="flex-1 bg-fitblue hover:bg-fitblue-600 rounded-full text-sm h-9"
          >
            <Compass className="w-4 h-4 mr-1" />
            Ver Missões
          </Button>
          
          {guildInfo.isUserGuildMaster && (
            <Button
              variant="outline"
              className="flex-1 border-fitblue text-fitblue rounded-full text-sm h-9"
            >
              <Shield className="w-4 h-4 mr-1" />
              Gerenciar Guilda
            </Button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Classificação</h3>
          
          <Select value={metricFilter} onValueChange={setMetricFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Métrica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xp">EXP Ganho</SelectItem>
              <SelectItem value="workouts">Dias de Treino</SelectItem>
              <SelectItem value="streak">Sequência</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="weekly" className="w-full" value={timeFilter} onValueChange={setTimeFilter}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="alltime">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Podium for top 3 */}
      <LeaderboardPodium members={topMembers} />
      
      {/* Members List */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg">Todos os Membros</h3>
          <Button variant="outline" size="sm" className="h-8 px-3 text-sm border-gray-200">
            <Filter className="h-3.5 w-3.5 mr-1" />
            Filtrar
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-430px)]">
          <MemberRankingList members={allMembers} />
        </ScrollArea>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildLeaderboardPage;
