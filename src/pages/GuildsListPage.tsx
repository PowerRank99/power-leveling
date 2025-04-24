import React, { useState } from 'react';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchIcon, PlusIcon } from 'lucide-react';
import GuildCard from '@/components/guilds/GuildCard';
import { useAuth } from '@/hooks/useAuth';
import EmptyState from '@/components/ui/EmptyState';
import { motion } from 'framer-motion';
import { useGuildNavigation } from '@/hooks/useGuildNavigation';

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
  
  // Animation variants for list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
  };
  
  return (
    <div className="min-h-screen bg-midnight-base pb-16">
      {/* Introduction Banner with Enhanced Gradient */}
      <div className="bg-gradient-to-r from-arcane to-valor text-text-primary p-4 border-b border-arcane-30 shadow-glow-subtle">
        <h2 className="text-xl font-orbitron font-bold mb-1 tracking-wider text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Guildas</h2>
        <p className="text-sm text-text-primary/90 font-sora mb-3 leading-relaxed" style={{ textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)' }}>
          Junte-se a outros atletas, complete missões e ganhe recompensas juntos.
        </p>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Enhanced Search and Create */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
            <Input 
              placeholder="Pesquisar guildas..." 
              className="pl-9 bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora focus:border-arcane-30 focus:shadow-glow-subtle transition-shadow duration-300" 
              value={searchQuery} 
              onChange={handleSearch} 
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleCreateGuild} 
              className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30 hover:shadow-glow-purple transition-all duration-300 group"
            >
              <PlusIcon className="h-5 w-5 mr-1 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline font-sora">Criar Guilda</span>
            </Button>
          </motion.div>
        </div>
        
        {/* Enhanced Tabs with Improved Styling */}
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
            {filteredMyGuilds.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <motion.div 
                  className="space-y-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredMyGuilds.map(guild => (
                    <motion.div key={guild.id} variants={item}>
                      <GuildCard guild={guild} isUserMember={true} />
                    </motion.div>
                  ))}
                </motion.div>
              </ScrollArea>
            ) : (
              <EmptyState 
                icon="Users" 
                title="Nenhuma guilda encontrada" 
                description="Você ainda não participa de nenhuma guilda ou nenhuma corresponde à sua pesquisa." 
                action={
                  <Button 
                    onClick={handleCreateGuild} 
                    className="bg-arcane hover:bg-arcane-60 mt-4 text-text-primary shadow-glow-subtle border border-arcane-30 transition-all duration-300 hover:shadow-glow-purple group hover:-translate-y-1"
                  >
                    <span>Criar uma guilda</span>
                    <motion.span
                      animate={{ x: [0, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <PlusIcon className="h-4 w-4 ml-1.5" />
                    </motion.span>
                  </Button>
                } 
              />
            )}
          </TabsContent>
          
          <TabsContent value="suggested" className="mt-4 space-y-4 animate-fade-in">
            {filteredSuggestedGuilds.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <motion.div 
                  className="space-y-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredSuggestedGuilds.map(guild => (
                    <motion.div key={guild.id} variants={item}>
                      <GuildCard guild={guild} isUserMember={false} />
                    </motion.div>
                  ))}
                </motion.div>
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
