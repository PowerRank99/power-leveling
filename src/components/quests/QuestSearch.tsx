
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface QuestSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  guildId: string;
  isGuildMaster: boolean;
}

const QuestSearch: React.FC<QuestSearchProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  guildId,
  isGuildMaster
}) => {
  const navigate = useNavigate();
  
  const handleCreateQuest = () => {
    navigate(`/guilds/${guildId}/quests/criar`);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center">
        <h2 className="text-xl font-orbitron font-bold text-text-primary">Quests</h2>
        <div className="ml-auto">
          {isGuildMaster && (
            <Button 
              onClick={handleCreateQuest}
              size="sm"
              className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle"
            >
              <Plus className="h-4 w-4 mr-1" /> Nova Quest
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar quests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-2 bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary focus:border-arcane-30 focus:ring-1 focus:ring-arcane-30"
        />
      </div>
    </div>
  );
};

export default QuestSearch;
