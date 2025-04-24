
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import GuildCreationForm from '@/components/guilds/GuildCreationForm';
import { motion } from 'framer-motion';

const CreateGuildPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = (guildId: string) => {
    navigate(`/guilds/${guildId}/leaderboard`);
  };
  
  const handleCancel = () => {
    navigate('/guilds');
  };
  
  return (
    <div className="min-h-screen bg-midnight-base pb-16">
      <PageHeader 
        title="Criar Guilda" 
        showBackButton={true}
      />
      
      <motion.div 
        className="p-4 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GuildCreationForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </motion.div>
      
      <BottomNavBar />
    </div>
  );
};

export default CreateGuildPage;
