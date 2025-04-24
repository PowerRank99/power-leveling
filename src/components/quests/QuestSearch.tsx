
import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface QuestSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  guildId: string;
  isGuildMaster: boolean;
  onCreateQuest?: () => void;
}

const QuestSearch: React.FC<QuestSearchProps> = ({
  searchQuery,
  setSearchQuery,
  guildId,
  isGuildMaster,
  onCreateQuest
}) => {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
        <Input 
          placeholder="Pesquisar missões..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-midnight-elevated border-divider text-text-primary"
        />
      </div>
      
      {isGuildMaster && (
        <Button 
          onClick={onCreateQuest}
          className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30"
        >
          <Plus className="h-5 w-5 mr-1" />
          <span className="hidden sm:inline">Nova Missão</span>
        </Button>
      )}
    </div>
  );
};

export default QuestSearch;
