
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-midnight-base">
        <div className="premium-card p-6 shadow-elevated max-w-md">
          <h1 className="text-xl font-orbitron font-bold text-valor mb-2">Erro</h1>
          <p className="text-text-secondary font-sora">ID da Guilda inválido ou não encontrado.</p>
          <button 
            onClick={() => navigate('/guilds')}
            className="mt-4 w-full bg-arcane hover:bg-arcane-60 text-text-primary py-2 px-4 rounded-md font-sora"
          >
            Voltar para Guildas
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <AuthRequiredRoute>
      <div className="flex flex-col min-h-screen bg-midnight-base">
        <QuestFormHeader 
          title="Criar Nova Quest" 
          onBackClick={handleBackClick} 
        />
        
        <div className="flex-1 p-4">
          <div className="premium-card p-6 shadow-subtle mb-6">
            <h1 className="text-2xl font-orbitron font-bold text-text-primary mb-2">Nova Quest</h1>
            <p className="text-text-secondary font-sora mb-4">
              Crie uma nova quest para desafiar os membros da sua guilda.
            </p>
          </div>
          
          <QuestForm guildId={guildId} />
        </div>
      </div>
    </AuthRequiredRoute>
  );
};

export default CreateQuestPage;
