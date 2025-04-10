
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
    <div className="sticky top-0 z-10 bg-midnight-base border-b border-divider shadow-subtle">
      <div className="p-4 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBackClick} 
          className="text-text-secondary hover:text-arcane hover:bg-arcane-15"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-arcane" />
          <h1 className="text-xl font-orbitron font-bold text-text-primary">{guildName} - Quests</h1>
        </div>
      </div>
    </div>
  );
};

export default QuestPageHeader;
