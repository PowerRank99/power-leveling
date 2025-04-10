
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, PlusIcon } from 'lucide-react';

interface GuildSearchProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateGuild: () => void;
}

const GuildSearch: React.FC<GuildSearchProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onCreateGuild 
}) => {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
        <Input 
          placeholder="Pesquisar guildas..." 
          className="pl-9 bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora shadow-inner" 
          value={searchQuery} 
          onChange={onSearchChange}
        />
      </div>
      <Button 
        onClick={onCreateGuild} 
        className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30 hover:shadow-glow-purple transition-all duration-300 gap-2 group"
      >
        <PlusIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
        <span className="hidden sm:inline font-sora">Criar Guilda</span>
      </Button>
    </div>
  );
};

export default GuildSearch;
