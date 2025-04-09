
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

interface QuestPageHeaderProps {
  guildId: string;
  guildName?: string;
}

const QuestPageHeader: React.FC<QuestPageHeaderProps> = ({ guildId, guildName = "Guilda" }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(`/guilds/${guildId}/leaderboard`);
  };

  return (
    <div className="p-4 flex items-center gap-2 bg-gradient-to-r from-fitblue to-blue-500 text-white shadow-md sticky top-0 z-10">
      <Button variant="ghost" size="icon" onClick={handleBackClick} className="text-white hover:bg-white/20">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        <h1 className="text-2xl font-bold">{guildName} - Quests</h1>
      </div>
    </div>
  );
};

export default QuestPageHeader;
