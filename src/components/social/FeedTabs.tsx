
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Globe, UserCircle } from 'lucide-react';

interface FeedTabsProps {
  activeTab: 'todos' | 'guildas' | 'amigos';
  onTabChange: (value: 'todos' | 'guildas' | 'amigos') => void;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="px-4 py-3 bg-midnight-card border-y border-divider sticky top-16 z-10 shadow-subtle">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as any)} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-midnight-elevated rounded-lg p-1">
          <TabsTrigger 
            value="todos" 
            className="font-orbitron text-sm py-3 rounded-md
                       data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane 
                       data-[state=active]:border-b-2 data-[state=active]:border-arcane 
                       data-[state=active]:shadow-glow-subtle transition-all duration-300 
                       flex items-center justify-center gap-2 tracking-wider"
          >
            <Globe className="w-4 h-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger 
            value="guildas" 
            className="font-orbitron text-sm py-3 rounded-md
                       data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane 
                       data-[state=active]:border-b-2 data-[state=active]:border-arcane 
                       data-[state=active]:shadow-glow-subtle transition-all duration-300
                       flex items-center justify-center gap-2 tracking-wider"
          >
            <Users className="w-4 h-4" />
            Guildas
          </TabsTrigger>
          <TabsTrigger 
            value="amigos" 
            className="font-orbitron text-sm py-3 rounded-md
                       data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane 
                       data-[state=active]:border-b-2 data-[state=active]:border-arcane 
                       data-[state=active]:shadow-glow-subtle transition-all duration-300
                       flex items-center justify-center gap-2 tracking-wider"
          >
            <UserCircle className="w-4 h-4" />
            Amigos
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default FeedTabs;
