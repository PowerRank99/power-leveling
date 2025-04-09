
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import QuestPageHeader from '@/components/quests/QuestPageHeader';
import QuestSearch from '@/components/quests/QuestSearch';
import QuestTabs from '@/components/quests/QuestTabs';
import { Quest } from '@/components/guilds/QuestCard';

const GuildQuestsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGuildMaster, setIsGuildMaster] = useState(true); // Mocked for now
  const [guildName, setGuildName] = useState("Guilda dos Guerreiros"); // Mock guild name
  
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <QuestPageHeader guildId={id || ''} />
      
      <div className="p-4 space-y-4">
        <QuestSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          guildId={id || ''}
          isGuildMaster={isGuildMaster}
        />
        
        <QuestTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredQuests={filteredQuests}
          guildId={id || ''}
          isGuildMaster={isGuildMaster}
          handleQuestClick={handleQuestClick}
        />
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default GuildQuestsPage;
