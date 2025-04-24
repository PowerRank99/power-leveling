
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useGuildNavigation } from '@/hooks/useGuildNavigation';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import GuildListHeader from '@/components/guilds/GuildListHeader';
import GuildSearchBar from '@/components/guilds/GuildSearchBar';
import GuildTabContent from '@/components/guilds/GuildTabContent';
import { GuildService } from '@/services/rpg/guild/GuildService';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Define Guild interface to ensure consistent typing
interface Guild {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  level: number;
  questCount: number;
  isUserGuildMaster: boolean;
}

const GuildsListPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-guilds');
  const [myGuilds, setMyGuilds] = useState<Guild[]>([]);
  const [suggestedGuilds, setSuggestedGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const guildNavigation = useGuildNavigation('');
  
  useEffect(() => {
    const fetchGuilds = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch guilds the user is a member of
        const userGuildsData = await GuildService.getUserGuilds(user.id);
        const mappedUserGuilds = userGuildsData.map(guild => ({
          id: guild.id,
          name: guild.name,
          description: guild.description || '',
          avatar: guild.avatar_url || "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png", // Default avatar if none
          memberCount: guild.memberCount || 0,
          level: calculateGuildLevel(guild.total_xp || 0),
          questCount: guild.activeRaidsCount || 0,
          isUserGuildMaster: guild.role === 'guild_master'
        }));
        
        // Fetch suggested guilds (guilds the user is not a member of)
        const allGuildsData = await GuildService.listGuilds();
        const userGuildIds = mappedUserGuilds.map(g => g.id);
        const filteredSuggestedGuilds = allGuildsData
          .filter(guild => !userGuildIds.includes(guild.id))
          .map(guild => ({
            id: guild.id,
            name: guild.name,
            description: guild.description || '',
            avatar: guild.avatar_url || "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png", // Default avatar if none
            memberCount: guild.guild_members?.count || 0,
            level: calculateGuildLevel(guild.total_xp || 0),
            questCount: 0, // We don't have active quests count in this query
            isUserGuildMaster: false
          }));
        
        setMyGuilds(mappedUserGuilds);
        setSuggestedGuilds(filteredSuggestedGuilds);
      } catch (error) {
        console.error("Error fetching guilds:", error);
        toast.error("Erro ao carregar guildas", {
          description: "Não foi possível carregar as guildas. Tente novamente."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGuilds();
  }, [user?.id]);
  
  // Calculate guild level based on XP (placeholder implementation)
  const calculateGuildLevel = (totalXp: number): number => {
    if (totalXp <= 0) return 1;
    // Simple level calculation: every 1000 XP = 1 level
    return Math.max(1, Math.floor(totalXp / 1000) + 1);
  };
  
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

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-base pb-16 flex items-center justify-center">
        <LoadingSpinner 
          message="Carregando Guildas" 
          subMessage="Buscando suas guildas e sugestões..." 
          size="lg"
        />
        <BottomNavBar />
      </div>
    );
  }

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
