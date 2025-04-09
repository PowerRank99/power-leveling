
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusIcon, SearchIcon } from 'lucide-react';
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
  
  // Mock data for quests
  const mockQuests: Quest[] = [
    {
      id: '1',
      title: 'Desafio de 30 dias',
      description: 'Complete um treino todos os dias por 30 dias consecutivos',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      status: 'active',
      participantsCount: 12,
      completionRate: 45,
      rewards: [
        { type: 'xp', amount: 500 },
        { type: 'badge', name: 'Desafiante' }
      ],
      difficulty: 'medium',
      type: 'attendance'
    },
    {
      id: '2',
      title: 'Meta de força',
      description: 'Aumente seu peso no supino em 10kg até o final do mês',
      startDate: '2025-04-05',
      endDate: '2025-05-05',
      status: 'active',
      participantsCount: 8,
      completionRate: 30,
      rewards: [
        { type: 'xp', amount: 300 },
        { type: 'item', name: 'Poção de recuperação' }
      ],
      difficulty: 'hard',
      type: 'challenge'
    },
    {
      id: '3',
      title: 'Maratona de treinos',
      description: 'Complete 15 treinos neste mês',
      startDate: '2025-03-15',
      endDate: '2025-04-15',
      status: 'completed',
      participantsCount: 20,
      completionRate: 100,
      rewards: [
        { type: 'xp', amount: 400 }
      ],
      difficulty: 'easy',
      type: 'workout'
    }
  ];
  
  // Filtering quests based on tab and search query
  const filteredQuests = mockQuests.filter(quest => {
    const matchesStatus = 
      (activeTab === 'active' && quest.status === 'active') ||
      (activeTab === 'completed' && quest.status === 'completed') ||
      (activeTab === 'all');
    
    const matchesSearch = 
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  const handleCreateQuest = () => {
    navigate(`/guilds/${id}/quests/criar`);
  };
  
  const handleQuestClick = (questId: string) => {
    // For now, just log the click. Later, could navigate to quest detail
    console.log(`Quest clicked: ${questId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <PageHeader title="Missões da Guilda" />
      
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
            <Button onClick={handleCreateQuest} className="bg-fitblue">
              <PlusIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Criar Missão</span>
            </Button>
          )}
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
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
                    <Button onClick={handleCreateQuest} className="bg-fitblue mt-4">
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
