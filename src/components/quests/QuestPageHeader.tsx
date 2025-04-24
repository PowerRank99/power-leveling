
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestPageHeaderProps {
  guildId: string;
  guildName: string;
}

const QuestPageHeader: React.FC<QuestPageHeaderProps> = ({ guildId, guildName }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(`/guilds/${guildId}/leaderboard`);
  };
  
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-midnight-base border-b border-divider sticky top-0 z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-2 hover:bg-arcane-15 text-text-secondary hover:text-arcane transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-arcane mr-1.5" />
          <h1 className="text-lg font-orbitron font-bold text-text-primary">Missões</h1>
        </div>
      </div>
      <div className="text-sm text-text-secondary font-sora">{guildName}</div>
    </div>
  );
};

export default QuestPageHeader;
