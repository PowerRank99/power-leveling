
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusIcon, SearchIcon, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import QuestCard, { Quest } from '@/components/guilds/QuestCard';
import EmptyState from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';

const GuildQuestsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGuildMaster, setIsGuildMaster] = useState(true); // Mocked for now
  const [guildName, setGuildName] = useState("Guilda dos Guerreiros"); // Mock guild name
  
  // Mock data for quests
  const mockQuests: Quest[] = [
    {
      id: '1',
      title: 'Treino Intenso',
      guildName: 'Guilda dos Guerreiros',
      startDate: '2025-01-20',
      endDate: '2025-01-24',
      status: 'active',
      daysCompleted: 3,
      daysRequired: 5,
      rewards: [
        { type: 'xp', amount: 200 }
      ]
    },
    {
      id: '2',
      title: 'Desafio Semanal',
      guildName: 'Guilda dos Monges',
      startDate: '2025-01-13',
      endDate: '2025-01-19',
      status: 'completed',
      daysCompleted: 7,
      daysRequired: 7,
      rewards: [
        { type: 'xp', amount: 200 }
      ]
    },
    {
      id: '3',
      title: 'Maratona Ninja',
      guildName: 'Guilda dos Ninjas',
      startDate: '2025-01-13',
      endDate: '2025-01-18',
      status: 'failed',
      daysCompleted: 2,
      daysRequired: 5,
      rewards: [
        { type: 'xp', amount: 150 }
      ]
    }
  ];
  
  // Filtering quests based on tab and search query
  const filteredQuests = mockQuests.filter(quest => {
    const matchesStatus = 
      (activeTab === 'active' && quest.status === 'active') ||
      (activeTab === 'completed' && quest.status === 'completed') ||
      (activeTab === 'failed' && quest.status === 'failed') ||
      (activeTab === 'all');
    
    const matchesSearch = 
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.guildName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  const handleCreateQuest = () => {
    navigate(`/guilds/${id}/quests/criar`);
  };
  
  const handleQuestClick = (questId: string) => {
    // For now, just log the click. Later, could navigate to quest detail
    console.log(`Quest clicked: ${questId}`);
  };

  const handleBackClick = () => {
    navigate(`/guilds/${id}/leaderboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="p-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Quests Ativas</h1>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Search and Create */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Pesquisar missões..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isGuildMaster && (
            <Button onClick={handleCreateQuest} className="bg-blue-500 hover:bg-blue-600">
              <PlusIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Criar Missão</span>
            </Button>
          )}
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="failed">Falhadas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4 space-y-4">
            {filteredQuests.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-4">
                  {filteredQuests.map(quest => (
                    <QuestCard 
                      key={quest.id} 
                      quest={quest} 
                      onClick={() => handleQuestClick(quest.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState 
                icon="Compass" 
                title="Nenhuma missão ativa" 
                description="Esta guilda não possui missões ativas no momento."
                action={
                  isGuildMaster ? (
                    <Button onClick={handleCreateQuest} className="bg-blue-500 mt-4">
                      Criar uma missão
                    </Button>
                  ) : undefined
                }
              />
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4 space-y-4">
            {filteredQuests.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-4">
                  {filteredQuests.map(quest => (
                    <QuestCard 
                      key={quest.id} 
                      quest={quest} 
                      onClick={() => handleQuestClick(quest.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState 
                icon="Trophy" 
                title="Nenhuma missão concluída" 
                description="Esta guilda ainda não completou nenhuma missão."
              />
            )}
          </TabsContent>
          
          <TabsContent value="failed" className="mt-4 space-y-4">
            {filteredQuests.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-4">
                  {filteredQuests.map(quest => (
                    <QuestCard 
                      key={quest.id} 
                      quest={quest} 
                      onClick={() => handleQuestClick(quest.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState 
                icon="X" 
                title="Nenhuma missão falhou" 
                description="Esta guilda não tem missões que tenham falhado."
              />
            )}
          </TabsContent>
          
          <TabsContent value="all" className="mt-4 space-y-4">
            {filteredQuests.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-4">
                  {filteredQuests.map(quest => (
                    <QuestCard 
                      key={quest.id} 
                      quest={quest} 
                      onClick={() => handleQuestClick(quest.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState 
                icon="Compass" 
                title="Nenhuma missão encontrada" 
                description="Não foram encontradas missões com este filtro."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildQuestsPage;
