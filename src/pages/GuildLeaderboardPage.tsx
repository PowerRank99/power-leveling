
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UsersIcon, Filter, Crown, Shield, Compass, Share2, TrendingUp, Trophy } from 'lucide-react';
import LeaderboardPodium from '@/components/guilds/LeaderboardPodium';
import MemberRankingList from '@/components/guilds/MemberRankingList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GuildLeaderboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [metricFilter, setMetricFilter] = useState('xp');
  const [showStats, setShowStats] = useState(true);
  
  // Mock data for initial UI
  const guildInfo = {
    name: "Guerreiros do Fitness",
    avatar: "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
    memberCount: 32,
    activeMemberCount: 28,
    level: 5,
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
  
  const topMembers = [
    { id: "1", name: "Você", avatar: pixelAvatar1, points: 1250, position: 1, isCurrentUser: true, badge: "Mestre da Guilda" },
    { id: "2", name: "João Silva", avatar: pixelAvatar2, points: 1100, position: 2 },
    { id: "3", name: "Maria Santos", avatar: pixelAvatar3, points: 950, position: 3 }
  ];
  
  const allMembers = [
    ...topMembers,
    { id: "4", name: "Carlos Oliveira", avatar: pixelAvatar4, points: 820, position: 4 },
    { id: "5", name: "Ana Costa", avatar: pixelAvatar5, points: 790, position: 5 },
    { id: "6", name: "Pedro Souza", avatar: pixelAvatar4, points: 730, position: 6 },
    { id: "7", name: "Lúcia Ferreira", avatar: pixelAvatar3, points: 690, position: 7, badge: "Moderadora" },
    { id: "8", name: "Ricardo Santos", avatar: pixelAvatar2, points: 640, position: 8 },
    { id: "9", name: "Beatriz Lima", avatar: pixelAvatar5, points: 590, position: 9 }
  ];
  
  const handleQuestsClick = () => {
    navigate(`/guilds/${id}/quests`);
  };
  
  const handleShareRanking = () => {
    toast.success('Link copiado!', {
      description: 'Link do ranking copiado para a área de transferência.'
    });
  };
  
  const handleCongratulate = (memberId: string, memberName: string) => {
    toast.success('Parabéns enviados!', {
      description: `Você enviou parabéns para ${memberName} pelo desempenho.`
    });
  };
  
  const toggleStats = () => {
    setShowStats(!showStats);
  };
  
  useEffect(() => {
    // Animation effect when component mounts
    const timer = setTimeout(() => {
      const podium = document.querySelector('.podium-container');
      if (podium) {
        podium.classList.add('animate-fade-in');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
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
      <PageHeader 
        title="Classificação da Guilda" 
        rightContent={
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShareRanking}
            className="text-gray-600"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        }
      />
      
      {/* Guild Info with enhanced visuals */}
      <div className="bg-gradient-to-r from-fitblue to-blue-500 text-white p-4">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 shadow-md border-2 border-white/30">
            <img src={guildInfo.avatar} alt={guildInfo.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold flex items-center">
              {guildInfo.name}
              <Badge className="ml-2 bg-yellow-500/80 text-white text-xs">Nível {guildInfo.level}</Badge>
            </h2>
            <div className="flex text-sm text-white/80 mt-1 flex-wrap gap-x-4">
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>{guildInfo.memberCount} membros</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-1 text-yellow-300" />
                <span>{guildInfo.completedQuests} missões completadas</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex mt-4 gap-2">
          <Button 
            onClick={handleQuestsClick}
            className="flex-1 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm rounded-full text-sm h-9"
          >
            <Compass className="w-4 h-4 mr-1" />
            Ver Missões
          </Button>
          
          {guildInfo.isUserGuildMaster && (
            <Button
              variant="outline"
              className="flex-1 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm rounded-full text-sm h-9"
            >
              <Shield className="w-4 h-4 mr-1" />
              Gerenciar Guilda
            </Button>
          )}
        </div>
      </div>
      
      {/* Guild Stats Dashboard - Collapsible */}
      <div className="bg-white border-b border-gray-200 overflow-hidden transition-all duration-300 shadow-sm">
        <div 
          className="p-3 flex justify-between items-center cursor-pointer border-b border-gray-100"
          onClick={toggleStats}
        >
          <h3 className="text-sm font-semibold text-gray-600 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1.5 text-fitblue" />
            Estatísticas da Guilda
          </h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            {showStats ? '−' : '+'}
          </Button>
        </div>
        
        {showStats && (
          <div className="p-4 grid grid-cols-2 gap-3 animate-fade-in">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="text-xs text-gray-500 mb-1">EXP Semanal</div>
              <div className="text-xl font-bold text-fitblue flex items-center">
                {guildInfo.weeklyExp} <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="text-xs text-gray-500 mb-1">EXP Total</div>
              <div className="text-xl font-bold text-purple-600">
                {guildInfo.totalExp}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="text-xs text-gray-500 mb-1">Membros Ativos</div>
              <div className="text-xl font-bold text-green-600">
                {guildInfo.activeMemberCount}/{guildInfo.memberCount}
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="text-xs text-gray-500 mb-1">Missões Ativas</div>
              <div className="text-xl font-bold text-amber-600">
                {guildInfo.activeQuests}
              </div>
            </div>
          </div>
        )}
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
      
      {/* Podium for top 3 with animation */}
      <div className="podium-container opacity-0 transition-opacity duration-700">
        <LeaderboardPodium members={topMembers} />
      </div>
      
      {/* Members List with enhanced interaction */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg">Todos os Membros</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 px-3 text-sm border-gray-200">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filtrar
            </Button>
            
            <Select defaultValue="table">
              <SelectTrigger className="w-[100px] h-8 px-3 text-sm border-gray-200">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cards">Cards</SelectItem>
                <SelectItem value="table">Tabela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Tabular view for better data comparison */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Pos.</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
                <TableHead className="w-16 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allMembers.map((member) => (
                <TableRow key={member.id} className={member.isCurrentUser ? "bg-blue-50" : ""}>
                  <TableCell className="text-center font-medium">
                    {member.position === 1 ? (
                      <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-auto" />
                    ) : member.position === 2 ? (
                      <Trophy className="h-4 w-4 text-gray-400 mx-auto" />
                    ) : member.position === 3 ? (
                      <Trophy className="h-4 w-4 text-orange-400 mx-auto" />
                    ) : (
                      member.position
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className={`h-8 w-8 mr-2 ${member.isCurrentUser ? 'ring-2 ring-fitblue' : ''}`}>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center">
                          {member.name}
                          {member.isCurrentUser && <span className="text-xs text-blue-500 ml-2">(Você)</span>}
                        </div>
                        {member.badge && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-white">{member.badge}</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {member.points} pts
                  </TableCell>
                  <TableCell>
                    {!member.isCurrentUser && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 p-0 text-gray-500 hover:text-fitblue"
                        onClick={() => handleCongratulate(member.id, member.name)}
                      >
                        👏
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Card view for mobile-friendly display */}
        <ScrollArea className="h-[calc(100vh-430px)]">
          <MemberRankingList members={allMembers} />
        </ScrollArea>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildLeaderboardPage;
