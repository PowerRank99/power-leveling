
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusIcon, SearchIcon } from 'lucide-react';
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
    <div className="flex gap-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Buscar quests..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isGuildMaster && (
        <Button onClick={handleCreateQuest} className="bg-blue-500 hover:bg-blue-600">
          <PlusIcon className="h-5 w-5 mr-1" />
          <span className="hidden sm:inline">Criar Quest</span>
        </Button>
      )}
    </div>
  );
};

export default QuestSearch;
