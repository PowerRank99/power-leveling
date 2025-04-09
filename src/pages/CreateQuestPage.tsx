
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import QuestFormHeader from '@/components/quests/QuestFormHeader';
import QuestForm from '@/components/quests/QuestForm';
import { useNavigate } from 'react-router-dom';

const CreateQuestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleBackClick = () => {
    navigate(`/guilds/${id}/quests`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <QuestFormHeader 
        title="Criar Quest" 
        onBackClick={handleBackClick}
      />
      
      <div className="p-6">
        <QuestForm guildId={id || ''} />
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default CreateQuestPage;
