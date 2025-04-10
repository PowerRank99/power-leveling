
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
            className={`${activeTab === 'todos' ? 'bg-arcane-15 text-arcane border-b-2 border-arcane' : 'text-text-secondary'} transition-all duration-300 data-[state=active]:shadow-none`}
          >
            Todos
          </TabsTrigger>
          <TabsTrigger 
            value="guildas" 
            className={`${activeTab === 'guildas' ? 'bg-arcane-15 text-arcane border-b-2 border-arcane' : 'text-text-secondary'} transition-all duration-300 data-[state=active]:shadow-none`}
          >
            Guildas
          </TabsTrigger>
          <TabsTrigger 
            value="amigos" 
            className={`${activeTab === 'amigos' ? 'bg-arcane-15 text-arcane border-b-2 border-arcane' : 'text-text-secondary'} transition-all duration-300 data-[state=active]:shadow-none`}
          >
            Amigos
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default FeedTabs;
