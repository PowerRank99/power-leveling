
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import GuildCard from '@/components/guilds/GuildCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';

interface GuildTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  myGuilds: any[];
  suggestedGuilds: any[];
  searchQuery: string;
  onCreateGuild: () => void;
}

const GuildTabs: React.FC<GuildTabsProps> = ({
  activeTab,
  onTabChange,
  myGuilds,
  suggestedGuilds,
  searchQuery,
  onCreateGuild
}) => {
  // Filter guilds based on search query
  const filteredMyGuilds = myGuilds.filter(guild => 
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSuggestedGuilds = suggestedGuilds.filter(guild => 
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-2 w-full bg-midnight-elevated overflow-hidden rounded-lg p-1 mb-5">
        <TabsTrigger 
          value="my-guilds" 
          className="rounded-md transition-all duration-300 font-orbitron tracking-wider py-2.5 text-text-secondary relative"
        >
          Minhas Guildas
          {activeTab === 'my-guilds' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-arcane transform transition-all duration-300 scale-x-100"></span>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="suggested" 
          className="rounded-md transition-all duration-300 font-orbitron tracking-wider py-2.5 text-text-secondary relative"
        >
          Sugeridas
          {activeTab === 'suggested' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-arcane transform transition-all duration-300 scale-x-100"></span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="my-guilds" className="mt-6 space-y-6 animate-fade-in">
        {filteredMyGuilds.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-6">
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
                onClick={onCreateGuild} 
                className="bg-arcane hover:bg-arcane-60 mt-4 text-text-primary shadow-glow-subtle border border-arcane-30 transition-all duration-300 hover:shadow-glow-purple"
              >
                Criar uma guilda
              </Button>
            } 
          />
        )}
      </TabsContent>
      
      <TabsContent value="suggested" className="mt-6 space-y-6 animate-fade-in">
        {filteredSuggestedGuilds.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-6">
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
  );
};

export default GuildTabs;
