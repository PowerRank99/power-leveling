
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Globe, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeedTabsProps {
  activeTab: 'todos' | 'guildas' | 'amigos';
  onTabChange: (tab: 'todos' | 'guildas' | 'amigos') => void;
}

const MotionTabsList = motion(TabsList);

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-12 z-10">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => onTabChange(value as 'todos' | 'guildas' | 'amigos')}
        className="w-full"
      >
        <MotionTabsList 
          className="grid grid-cols-3 w-full bg-transparent h-14 px-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsTrigger 
            value="todos" 
            className={`
              flex items-center justify-center gap-2
              data-[state=active]:border-b-2 data-[state=active]:border-fitblue-500 
              data-[state=active]:text-fitblue-500 data-[state=active]:shadow-none 
              text-base rounded-none
            `}
          >
            <Globe className="h-4 w-4" />
            <span>Todos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="guildas" 
            className={`
              flex items-center justify-center gap-2
              data-[state=active]:border-b-2 data-[state=active]:border-fitblue-500 
              data-[state=active]:text-fitblue-500 data-[state=active]:shadow-none 
              text-base rounded-none
            `}
          >
            <Users className="h-4 w-4" />
            <span>Guildas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="amigos" 
            className={`
              flex items-center justify-center gap-2
              data-[state=active]:border-b-2 data-[state=active]:border-fitblue-500 
              data-[state=active]:text-fitblue-500 data-[state=active]:shadow-none 
              text-base rounded-none
            `}
          >
            <UserCircle className="h-4 w-4" />
            <span>Amigos</span>
          </TabsTrigger>
        </MotionTabsList>
      </Tabs>
    </div>
  );
};

export default FeedTabs;
