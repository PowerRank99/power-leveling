import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import GuildBanner from '@/components/guilds/GuildBanner';
import GuildSearch from '@/components/guilds/GuildSearch';
import GuildFilters from '@/components/guilds/GuildFilters';
import GuildTabs from '@/components/guilds/GuildTabs';
import { GuildService } from '@/services/rpg/guild/GuildService';

const GuildsListPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-guilds');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Mock data for guilds
  const pixelAvatar1 = "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png";
  const pixelAvatar2 = "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png";
  const pixelAvatar3 = "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png";
  const pixelAvatar4 = "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png";
  
  const myGuilds = [
    {
      id: "1",
      name: "Guerreiros do Fitness",
      description: "Uma guilda para entusiastas de fitness",
      avatar: pixelAvatar1,
      memberCount: 32,
      level: 5,
      questCount: 2,
      isUserGuildMaster: true
    },
    {
      id: "2",
      name: "Atletas de Elite",
      description: "Treinamentos intensos para resultados máximos",
      avatar: pixelAvatar2,
      memberCount: 18,
      level: 3,
      questCount: 1,
      isUserGuildMaster: false
    }
  ];
  
  const suggestedGuilds = [
    {
      id: "3",
      name: "Runners Club",
      description: "Para os amantes de corrida",
      avatar: pixelAvatar3,
      memberCount: 45,
      level: 7,
      questCount: 3,
      isUserGuildMaster: false
    },
    {
      id: "4",
      name: "Yoga Masters",
      description: "Paz e equilíbrio através do yoga",
      avatar: pixelAvatar4,
      memberCount: 24,
      level: 4,
      questCount: 0,
      isUserGuildMaster: false
    }
  ];
  
  const filterOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'active', label: 'Ativas' },
    { id: 'popular', label: 'Populares' }
  ];
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCreateGuild = () => {
    console.log("Create guild clicked");
  };
  
  const handleFilterClick = (filterId: string) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };
  
  return (
    <div className="min-h-screen bg-midnight-base pb-20">
      <PageHeader title="Guildas" />
      
      {/* Introduction Banner with Accent Gradient */}
      <GuildBanner />
      
      <div className="p-5 space-y-5">
        {/* Search and Create */}
        <GuildSearch 
          searchQuery={searchQuery} 
          onSearchChange={handleSearch} 
          onCreateGuild={handleCreateGuild} 
        />
        
        {/* Filter chips */}
        <GuildFilters 
          filterOptions={filterOptions} 
          activeFilter={activeFilter} 
          onFilterClick={handleFilterClick} 
        />
        
        <Separator className="bg-divider/50 my-4" />
        
        {/* Tabs with Enhanced Styling */}
        <GuildTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          myGuilds={myGuilds}
          suggestedGuilds={suggestedGuilds}
          searchQuery={searchQuery}
          onCreateGuild={handleCreateGuild}
        />
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildsListPage;
