
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
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="failed">Failed</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="mt-4 space-y-4">
        {filteredQuests.length > 0 ? (
          <QuestList quests={filteredQuests} onQuestClick={handleQuestClick} />
        ) : (
          <EmptyState 
            icon="Compass" 
            title="No active quests" 
            description="This guild has no active quests at the moment."
            action={
              isGuildMaster ? (
                <Button onClick={handleCreateQuest} className="bg-blue-500 mt-4">
                  Create a quest
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
            title="No completed quests" 
            description="This guild hasn't completed any quests yet."
          />
        )}
      </TabsContent>
      
      <TabsContent value="failed" className="mt-4 space-y-4">
        {filteredQuests.length > 0 ? (
          <QuestList quests={filteredQuests} onQuestClick={handleQuestClick} />
        ) : (
          <EmptyState 
            icon="X" 
            title="No failed quests" 
            description="This guild has no failed quests."
          />
        )}
      </TabsContent>
      
      <TabsContent value="all" className="mt-4 space-y-4">
        {filteredQuests.length > 0 ? (
          <QuestList quests={filteredQuests} onQuestClick={handleQuestClick} />
        ) : (
          <EmptyState 
            icon="Compass" 
            title="No quests found" 
            description="No quests were found with this filter."
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default QuestTabs;
