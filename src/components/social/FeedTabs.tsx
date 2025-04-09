
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeedTabsProps {
  activeTab: 'todos' | 'guildas' | 'amigos';
  onTabChange: (tab: 'todos' | 'guildas' | 'amigos') => void;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => onTabChange(value as 'todos' | 'guildas' | 'amigos')}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full bg-transparent h-12">
          <TabsTrigger 
            value="todos" 
            className={`data-[state=active]:border-b-2 data-[state=active]:border-fitblue data-[state=active]:text-fitblue data-[state=active]:shadow-none text-base ${activeTab === 'todos' ? 'text-fitblue' : 'text-gray-500'}`}
          >
            Todos
          </TabsTrigger>
          <TabsTrigger 
            value="guildas" 
            className={`data-[state=active]:border-b-2 data-[state=active]:border-fitblue data-[state=active]:text-fitblue data-[state=active]:shadow-none text-base ${activeTab === 'guildas' ? 'text-fitblue' : 'text-gray-500'}`}
          >
            Guildas
          </TabsTrigger>
          <TabsTrigger 
            value="amigos" 
            className={`data-[state=active]:border-b-2 data-[state=active]:border-fitblue data-[state=active]:text-fitblue data-[state=active]:shadow-none text-base ${activeTab === 'amigos' ? 'text-fitblue' : 'text-gray-500'}`}
          >
            Amigos
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default FeedTabs;
