
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeedTabsProps {
  activeTab: 'todos' | 'guildas' | 'amigos';
  onTabChange: (value: 'todos' | 'guildas' | 'amigos') => void;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="px-4 py-2 bg-midnight-card border-y border-divider sticky top-16 z-10 shadow-subtle">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as any)} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-midnight-elevated">
          <TabsTrigger 
            value="todos" 
            className="font-orbitron text-sm data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=active]:shadow-none transition-all duration-300"
          >
            Todos
          </TabsTrigger>
          <TabsTrigger 
            value="guildas" 
            className="font-orbitron text-sm data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=active]:shadow-none transition-all duration-300"
          >
            Guildas
          </TabsTrigger>
          <TabsTrigger 
            value="amigos" 
            className="font-orbitron text-sm data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=active]:shadow-none transition-all duration-300"
          >
            Amigos
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default FeedTabs;
