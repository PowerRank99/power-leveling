import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useGuildNavigation } from '@/hooks/useGuildNavigation';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import GuildListHeader from '@/components/guilds/GuildListHeader';
import GuildSearchBar from '@/components/guilds/GuildSearchBar';
import GuildTabContent from '@/components/guilds/GuildTabContent';

const GuildsListPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-guilds');
  const guildNavigation = useGuildNavigation('');

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
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCreateGuild = () => {
    guildNavigation.goToCreateGuild();
  };
  
  const filteredMyGuilds = myGuilds.filter(guild => 
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSuggestedGuilds = suggestedGuilds.filter(guild => 
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-midnight-base pb-16">
      <GuildListHeader 
        title="Guildas"
        description="Junte-se a outros atletas, complete missões e ganhe recompensas juntos."
      />
      
      <div className="p-4 space-y-4">
        <GuildSearchBar 
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onCreateClick={handleCreateGuild}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-midnight-elevated overflow-hidden rounded-lg p-1">
            <TabsTrigger 
              value="my-guilds" 
              className="rounded-md transition-all duration-300 font-orbitron tracking-wider data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=inactive]:hover:bg-arcane-15/30 data-[state=inactive]:hover:text-text-primary text-text-secondary"
            >
              Minhas Guildas
            </TabsTrigger>
            <TabsTrigger 
              value="suggested" 
              className="rounded-md transition-all duration-300 font-orbitron tracking-wider data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=inactive]:hover:bg-arcane-15/30 data-[state=inactive]:hover:text-text-primary text-text-secondary"
            >
              Sugeridas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-guilds" className="mt-4 space-y-4 animate-fade-in">
            <GuildTabContent 
              guilds={filteredMyGuilds}
              isUserMember={true}
              onCreateGuild={handleCreateGuild}
            />
          </TabsContent>
          
          <TabsContent value="suggested" className="mt-4 space-y-4 animate-fade-in">
            <GuildTabContent 
              guilds={filteredSuggestedGuilds}
              isUserMember={false}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildsListPage;
