
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestFormHeader from '@/components/quests/QuestFormHeader';
import QuestForm from '@/components/quests/QuestForm';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';

const CreateQuestPage = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    navigate(`/guilds/${guildId}/quests`);
  };
  
  if (!guildId) {
    return <div>Invalid Guild ID</div>;
  }
  
  return (
    <AuthRequiredRoute>
      <div className="flex flex-col min-h-screen bg-midnight-base">
        <QuestFormHeader 
          title="Criar Nova Quest" 
          onBackClick={handleBackClick} 
        />
        
        <div className="flex-1 p-4">
          <QuestForm guildId={guildId} />
        </div>
      </div>
    </AuthRequiredRoute>
  );
};

export default CreateQuestPage;
