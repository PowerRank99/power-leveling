
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, PlusIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface GuildSearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateClick: () => void;
}

const GuildSearchBar: React.FC<GuildSearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onCreateClick 
}) => {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
        <Input 
          placeholder="Pesquisar guildas..." 
          className="pl-9 bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora focus:border-arcane-30 focus:shadow-glow-subtle transition-shadow duration-300" 
          value={searchQuery} 
          onChange={onSearchChange} 
        />
      </div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          onClick={onCreateClick} 
          className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30 hover:shadow-glow-purple transition-all duration-300 group"
        >
          <PlusIcon className="h-5 w-5 mr-1 group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline font-sora">Criar Guilda</span>
        </Button>
      </motion.div>
    </div>
  );
};

export default GuildSearchBar;
