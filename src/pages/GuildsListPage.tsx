import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchIcon, PlusIcon, Shield, Trophy, Compass } from 'lucide-react';
import GuildCard from '@/components/guilds/GuildCard';
import { useAuth } from '@/hooks/useAuth';
import EmptyState from '@/components/ui/EmptyState';
const GuildsListPage: React.FC = () => {
  const {
    user
  } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-guilds');

  // Mock data for guilds
  const pixelAvatar1 = "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png";
  const pixelAvatar2 = "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png";
  const pixelAvatar3 = "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png";
  const pixelAvatar4 = "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png";
  const myGuilds = [{
    id: "1",
    name: "Guerreiros do Fitness",
    description: "Uma guilda para entusiastas de fitness",
    avatar: pixelAvatar1,
    memberCount: 32,
    level: 5,
    questCount: 2,
    isUserGuildMaster: true
  }, {
    id: "2",
    name: "Atletas de Elite",
    description: "Treinamentos intensos para resultados máximos",
    avatar: pixelAvatar2,
    memberCount: 18,
    level: 3,
    questCount: 1,
    isUserGuildMaster: false
  }];
  const suggestedGuilds = [{
    id: "3",
    name: "Runners Club",
    description: "Para os amantes de corrida",
    avatar: pixelAvatar3,
    memberCount: 45,
    level: 7,
    questCount: 3,
    isUserGuildMaster: false
  }, {
    id: "4",
    name: "Yoga Masters",
    description: "Paz e equilíbrio através do yoga",
    avatar: pixelAvatar4,
    memberCount: 24,
    level: 4,
    questCount: 0,
    isUserGuildMaster: false
  }];
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleCreateGuild = () => {
    // Navigate to guild creation page or open modal
    console.log("Create guild clicked");
  };
  const filteredMyGuilds = myGuilds.filter(guild => guild.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSuggestedGuilds = suggestedGuilds.filter(guild => guild.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="min-h-screen bg-gray-50 pb-16">
      <PageHeader title="Guildas" />
      
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-fitblue to-blue-500 text-white p-4 border-b border-blue-200">
        <h2 className="text-xl font-bold mb-1">Guildas</h2>
        <p className="text-sm text-blue-100 mb-3">
          Junte-se a outros atletas, complete missões e ganhe recompensas juntos.
        </p>
        
        <div className="flex gap-3 flex-wrap">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 flex items-center text-sm">
            <Shield className="h-4 w-4 mr-1.5" />
            <span>Comunidade</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 flex items-center text-sm">
            <Compass className="h-4 w-4 mr-1.5" />
            <span>Missões</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 flex items-center text-sm">
            <Trophy className="h-4 w-4 mr-1.5" />
            <span>Conquistas</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Search and Create */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Pesquisar guildas..." className="pl-9" value={searchQuery} onChange={handleSearch} />
          </div>
          <Button onClick={handleCreateGuild} className="bg-fitblue hover:bg-fitblue-600">
            <PlusIcon className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Criar Guilda</span>
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="my-guilds">Minhas Guildas</TabsTrigger>
            <TabsTrigger value="suggested">Sugeridas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-guilds" className="mt-4 space-y-4">
            {filteredMyGuilds.length > 0 ? <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-4">
                  {filteredMyGuilds.map(guild => <GuildCard key={guild.id} guild={guild} isUserMember={true} />)}
                </div>
              </ScrollArea> : <EmptyState icon="Users" title="Nenhuma guilda encontrada" description="Você ainda não participa de nenhuma guilda ou nenhuma corresponde à sua pesquisa." action={<Button onClick={handleCreateGuild} className="bg-fitblue mt-4">
                    Criar uma guilda
                  </Button>} />}
          </TabsContent>
          
          <TabsContent value="suggested" className="mt-4 space-y-4">
            {filteredSuggestedGuilds.length > 0 ? <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  {filteredSuggestedGuilds.map(guild => <GuildCard key={guild.id} guild={guild} isUserMember={false} />)}
                </div>
              </ScrollArea> : <EmptyState icon="Users" title="Nenhuma guilda sugerida" description="Não foram encontradas guildas sugeridas para você no momento." />}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavBar />
    </div>;
};
export default GuildsListPage;