
import React, { useState } from 'react';
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

const GuildQuestsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGuildMaster, setIsGuildMaster] = useState(true); // Mocked for now
  const [guildName, setGuildName] = useState("Guilda dos Guerreiros"); // Mock guild name
  
  // Mock guild info
  const guildInfo = {
    name: "Guilda dos Guerreiros",
    avatar: "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
    memberCount: 32,
    level: 5
  };
  
  // Mock data for quests
  const mockQuests: Quest[] = [
    {
      id: '1',
      title: 'Treino Intenso',
      guildName: 'Guilda dos Guerreiros',
      startDate: '2025-01-20',
      endDate: '2025-01-24',
      status: 'active',
      daysCompleted: 3,
      daysRequired: 5,
      rewards: [
        { type: 'xp', amount: 200 }
      ]
    },
    {
      id: '2',
      title: 'Desafio Semanal',
      guildName: 'Guilda dos Monges',
      startDate: '2025-01-13',
      endDate: '2025-01-19',
      status: 'completed',
      daysCompleted: 7,
      daysRequired: 7,
      rewards: [
        { type: 'xp', amount: 200 }
      ]
    },
    {
      id: '3',
      title: 'Maratona Ninja',
      guildName: 'Guilda dos Ninjas',
      startDate: '2025-01-13',
      endDate: '2025-01-18',
      status: 'failed',
      daysCompleted: 2,
      daysRequired: 5,
      rewards: [
        { type: 'xp', amount: 150 }
      ]
    }
  ];
  
  // Filtering quests based on tab and search query
  const filteredQuests = mockQuests.filter(quest => {
    const matchesStatus = 
      (activeTab === 'active' && quest.status === 'active') ||
      (activeTab === 'completed' && quest.status === 'completed') ||
      (activeTab === 'failed' && quest.status === 'failed') ||
      (activeTab === 'all');
    
    const matchesSearch = 
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.guildName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  const handleQuestClick = (questId: string) => {
    // For now, just log the click. Later, could navigate to quest detail
    console.log(`Quest clicked: ${questId}`);
  };
  
  const handleLeaderboardClick = () => {
    navigate(`/guilds/${id}/leaderboard`);
  };

  return (
    <div className="min-h-screen bg-midnight-base pb-16">
      <QuestPageHeader guildId={id || ''} />
      
      {/* Guild Info Banner */}
      <div className="bg-gradient-to-r from-arcane to-valor p-4 border-b border-divider shadow-glow-subtle mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={guildInfo.avatar} 
              alt={guildInfo.name} 
              className="h-10 w-10 object-cover rounded-lg mr-3"
            />
            <div>
              <h2 className="font-bold text-lg font-orbitron text-text-primary">{guildInfo.name}</h2>
              <div className="flex gap-3 text-sm text-text-secondary font-sora">
                <span className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  {guildInfo.memberCount}
                </span>
                <span className="flex items-center">
                  <Crown className="h-3.5 w-3.5 mr-1 text-achievement" />
                  Level {guildInfo.level}
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
            <Shield className="h-4 w-4 mr-1" />
            Leaderboard
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="premium-card p-4 shadow-subtle mb-4">
          <QuestSearch 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            guildId={id || ''}
            isGuildMaster={isGuildMaster}
          />
        </div>
        
        <div className="premium-card p-4 shadow-subtle">
          <QuestTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredQuests={filteredQuests}
            guildId={id || ''}
            isGuildMaster={isGuildMaster}
            handleQuestClick={handleQuestClick}
          />
        </div>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildQuestsPage;
