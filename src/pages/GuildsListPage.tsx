
import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchIcon, PlusIcon, Shield, Trophy, Compass, FilterIcon } from 'lucide-react';
import GuildCard from '@/components/guilds/GuildCard';
import { useAuth } from '@/hooks/useAuth';
import EmptyState from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';

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
  
  const filteredMyGuilds = myGuilds.filter(guild => 
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSuggestedGuilds = suggestedGuilds.filter(guild => 
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-midnight-base pb-20">
      <PageHeader title="Guildas" />
      
      {/* Introduction Banner with Accent Gradient */}
      <div className="bg-gradient-to-r from-arcane to-valor text-text-primary p-5 border-b border-arcane-30 shadow-glow-subtle">
        <h2 className="text-xl font-orbitron font-bold mb-2 tracking-wider">Guildas</h2>
        <p className="text-sm text-text-secondary font-sora mb-4 leading-relaxed">
          Junte-se a outros atletas, complete missões e ganhe recompensas juntos.
        </p>
        
        {/* Category Pills with enhanced styling */}
        <div className="flex gap-3 flex-wrap">
          <div className="bg-midnight-elevated/40 backdrop-blur-sm rounded-full p-2 px-3.5 flex items-center text-sm border border-white/10 font-sora transition-all duration-300 hover:shadow-glow-purple hover:bg-midnight-elevated hover:border-arcane-30">
            <Shield className="h-4 w-4 mr-2 text-arcane" />
            <span>Comunidade</span>
          </div>
          <div className="bg-midnight-elevated/40 backdrop-blur-sm rounded-full p-2 px-3.5 flex items-center text-sm border border-white/10 font-sora transition-all duration-300 hover:shadow-glow-purple hover:bg-midnight-elevated hover:border-arcane-30">
            <Compass className="h-4 w-4 mr-2 text-arcane" />
            <span>Missões</span>
          </div>
          <div className="bg-midnight-elevated/40 backdrop-blur-sm rounded-full p-2 px-3.5 flex items-center text-sm border border-white/10 font-sora transition-all duration-300 hover:shadow-glow-purple hover:bg-midnight-elevated hover:border-arcane-30">
            <Trophy className="h-4 w-4 mr-2 text-achievement" />
            <span>Conquistas</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 space-y-5">
        {/* Search and Create */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
            <Input 
              placeholder="Pesquisar guildas..." 
              className="pl-9 bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora shadow-inner" 
              value={searchQuery} 
              onChange={handleSearch} 
            />
          </div>
          <Button 
            onClick={handleCreateGuild} 
            className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30 hover:shadow-glow-purple transition-all duration-300 gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline font-sora">Criar Guilda</span>
          </Button>
        </div>
        
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {filterOptions.map(filter => (
            <Badge
              key={filter.id}
              variant={activeFilter === filter.id ? "arcane" : "guild"}
              className="cursor-pointer px-3 py-1.5 text-sm font-sora"
              onClick={() => handleFilterClick(filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-midnight-elevated border-divider hover:bg-arcane-15 hover:border-arcane-30 text-text-secondary flex items-center gap-1.5 h-7 ml-1"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            Mais filtros
          </Button>
        </div>
        
        <Separator className="bg-divider/50 my-4" />
        
        {/* Tabs with Enhanced Styling */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-midnight-elevated overflow-hidden rounded-lg p-1 mb-5">
            <TabsTrigger 
              value="my-guilds" 
              className="rounded-md transition-all duration-300 font-orbitron tracking-wider py-2.5 text-text-secondary"
            >
              Minhas Guildas
            </TabsTrigger>
            <TabsTrigger 
              value="suggested" 
              className="rounded-md transition-all duration-300 font-orbitron tracking-wider py-2.5 text-text-secondary"
            >
              Sugeridas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-guilds" className="mt-4 space-y-5 animate-fade-in">
            {filteredMyGuilds.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-5">
                  {filteredMyGuilds.map(guild => (
                    <GuildCard key={guild.id} guild={guild} isUserMember={true} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState 
                icon="Users" 
                title="Nenhuma guilda encontrada" 
                description="Você ainda não participa de nenhuma guilda ou nenhuma corresponde à sua pesquisa." 
                action={
                  <Button 
                    onClick={handleCreateGuild} 
                    className="bg-arcane hover:bg-arcane-60 mt-4 text-text-primary shadow-glow-subtle border border-arcane-30 transition-all duration-300 hover:shadow-glow-purple"
                  >
                    Criar uma guilda
                  </Button>
                } 
              />
            )}
          </TabsContent>
          
          <TabsContent value="suggested" className="mt-4 space-y-5 animate-fade-in">
            {filteredSuggestedGuilds.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-5">
                  {filteredSuggestedGuilds.map(guild => (
                    <GuildCard key={guild.id} guild={guild} isUserMember={false} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState 
                icon="Users" 
                title="Nenhuma guilda sugerida" 
                description="Não foram encontradas guildas sugeridas para você no momento." 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildsListPage;
