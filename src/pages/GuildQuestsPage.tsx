
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import QuestPageHeader from '@/components/quests/QuestPageHeader';
import QuestSearch from '@/components/quests/QuestSearch';
import QuestTabs from '@/components/quests/QuestTabs';
import { Quest } from '@/components/guilds/QuestCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Crown } from 'lucide-react';
import { RaidService } from '@/services/rpg/guild/RaidService';
import { GuildService } from '@/services/rpg/guild/GuildService';
import { toast } from 'sonner';
import { CreateRaidModal } from '@/components/guilds';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const GuildQuestsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGuildMaster, setIsGuildMaster] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guildInfo, setGuildInfo] = useState<any>(null);
  const [raids, setRaids] = useState<Quest[]>([]);
  
  useEffect(() => {
    const fetchGuildData = async () => {
      if (!id || !user?.id) return;
      
      try {
        const guildData = await GuildService.getGuildDetails(id);
        const memberRole = await GuildService.getMemberRole(id, user.id);
        setIsGuildMaster(memberRole === 'guild_master');
        setGuildInfo(guildData);
        
        const activeRaids = await RaidService.getActiveRaids(id);
        const formattedRaids = activeRaids.map(raid => ({
          id: raid.id,
          title: raid.name,
          guildName: guildData.name || '',
          startDate: raid.startDate.toISOString(),
          endDate: raid.endDate.toISOString(),
          status: 'active' as const, // Using type assertion to match Quest type
          daysCompleted: raid.progress.currentValue,
          daysRequired: raid.daysRequired,
          rewards: [{ type: 'xp', amount: raid.raidDetails.xpReward }]
        }));
        
        setRaids(formattedRaids);
      } catch (error) {
        console.error('Error fetching guild data:', error);
        toast.error('Erro ao carregar dados da guilda', {
          description: 'Não foi possível carregar as missões. Tente novamente.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGuildData();
  }, [id, user?.id]);
  
  const handleCreateRaid = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleRaidCreated = (raidId: string) => {
    setIsCreateModalOpen(false);
    toast.success('Missão criada com sucesso!');
    // Refresh raids list
    if (id && user?.id) {
      RaidService.getActiveRaids(id).then(newRaids => {
        const formattedRaids = newRaids.map(raid => ({
          id: raid.id,
          title: raid.name,
          guildName: guildInfo?.name || '',
          startDate: raid.startDate.toISOString(),
          endDate: raid.endDate.toISOString(),
          status: 'active' as const, // Using type assertion
          daysCompleted: raid.progress.currentValue,
          daysRequired: raid.daysRequired,
          rewards: [{ type: 'xp', amount: raid.raidDetails.xpReward }]
        }));
        setRaids(formattedRaids);
      });
    }
  };
  
  const handleQuestClick = async (questId: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para participar');
      return;
    }
    
    try {
      const result = await RaidService.trackParticipation(questId, user.id);
      if (result) {
        toast.success('Participação registrada com sucesso!');
        // Refresh raids to update progress
        if (id) {
          const updatedRaids = await RaidService.getActiveRaids(id);
          const formattedRaids = updatedRaids.map(raid => ({
            id: raid.id,
            title: raid.name,
            guildName: guildInfo?.name || '',
            startDate: raid.startDate.toISOString(),
            endDate: raid.endDate.toISOString(),
            status: 'active' as const, // Using type assertion
            daysCompleted: raid.progress.currentValue,
            daysRequired: raid.daysRequired,
            rewards: [{ type: 'xp', amount: raid.raidDetails.xpReward }]
          }));
          setRaids(formattedRaids);
        }
      }
    } catch (error) {
      console.error('Error participating in raid:', error);
      toast.error('Erro ao participar da missão');
    }
  };
  
  const handleLeaderboardClick = () => {
    navigate(`/guilds/${id}/leaderboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-base pb-16 flex items-center justify-center">
        <LoadingSpinner 
          message="Carregando Missões" 
          subMessage="Buscando missões ativas..." 
          size="lg"
        />
        <BottomNavBar />
      </div>
    );
  }

  // Filter raids based on search and tab
  const filteredRaids = raids.filter(raid => {
    const matchesSearch = raid.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'all' || raid.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-midnight-base pb-16">
      <QuestPageHeader guildId={id || ''} guildName={guildInfo?.name || ''} />
      
      {/* Guild Info Banner */}
      <div className="bg-gradient-to-r from-arcane-30 to-valor-30 p-4 border-b border-divider shadow-glow-subtle mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={guildInfo?.avatar_url || "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png"} 
              alt={guildInfo?.name} 
              className="h-12 w-12 object-cover rounded-lg mr-3 border border-white/20 shadow-glow-purple"
            />
            <div>
              <h2 className="font-bold text-lg font-orbitron text-text-primary">{guildInfo?.name}</h2>
              <div className="flex gap-3 text-sm text-text-secondary font-sora">
                <span className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1 text-text-secondary" />
                  {guildInfo?.memberCount || 0}
                </span>
                <span className="flex items-center">
                  <Crown className="h-3.5 w-3.5 mr-1 text-achievement" />
                  Level {guildInfo?.level || 1}
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-arcane-30 text-text-primary bg-midnight-elevated/30 backdrop-blur-sm hover:bg-arcane-15 font-sora"
            onClick={handleLeaderboardClick}
          >
            <Shield className="h-4 w-4 mr-1 text-arcane" />
            Leaderboard
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="premium-card p-4 shadow-subtle">
          <QuestSearch 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            guildId={id || ''}
            isGuildMaster={isGuildMaster}
            onCreateQuest={handleCreateRaid}
          />
        </div>
        
        <div className="premium-card p-4 shadow-subtle">
          <QuestTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredQuests={filteredRaids}
            guildId={id || ''}
            isGuildMaster={isGuildMaster}
            handleQuestClick={handleQuestClick}
          />
        </div>
      </div>
      
      <CreateRaidModal
        guildId={id || ''}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleRaidCreated}
      />
      
      <BottomNavBar />
    </div>
  );
};

export default GuildQuestsPage;
