
import React from 'react';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import QuestList from './QuestList';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Quest } from '@/components/guilds/QuestCard';

interface QuestTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredQuests: Quest[];
  guildId: string;
  isGuildMaster: boolean;
  handleQuestClick: (questId: string) => void;
}

const QuestTabs: React.FC<QuestTabsProps> = ({
  activeTab,
  setActiveTab,
  filteredQuests,
  guildId,
  isGuildMaster,
  handleQuestClick
}) => {
  const navigate = useNavigate();
  
  const handleCreateQuest = () => {
    navigate(`/guilds/${guildId}/quests/criar`);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="active">Ativas</TabsTrigger>
        <TabsTrigger value="completed">Concluídas</TabsTrigger>
        <TabsTrigger value="failed">Falhadas</TabsTrigger>
        <TabsTrigger value="all">Todas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="mt-4 space-y-4">
        {filteredQuests.length > 0 ? (
          <QuestList quests={filteredQuests} onQuestClick={handleQuestClick} />
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
          <QuestList quests={filteredQuests} onQuestClick={handleQuestClick} />
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
          <QuestList quests={filteredQuests} onQuestClick={handleQuestClick} />
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
          <QuestList quests={filteredQuests} onQuestClick={handleQuestClick} />
        ) : (
          <EmptyState 
            icon="Compass" 
            title="Nenhuma missão encontrada" 
            description="Não foram encontradas missões com este filtro."
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default QuestTabs;
