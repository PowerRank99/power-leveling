
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import QuestCard, { Quest } from '@/components/guilds/QuestCard';

interface QuestListProps {
  quests: Quest[];
  onQuestClick: (questId: string) => void;
}

const QuestList: React.FC<QuestListProps> = ({ quests, onQuestClick }) => {
  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-4">
        {quests.map(quest => (
          <QuestCard 
            key={quest.id} 
            quest={quest} 
            onClick={() => onQuestClick(quest.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default QuestList;
