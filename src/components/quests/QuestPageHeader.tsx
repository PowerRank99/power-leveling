
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface QuestPageHeaderProps {
  guildId: string;
}

const QuestPageHeader: React.FC<QuestPageHeaderProps> = ({ guildId }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(`/guilds/${guildId}/leaderboard`);
  };

  return (
    <div className="p-4 flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={handleBackClick}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-bold">Quests Ativas</h1>
    </div>
  );
};

export default QuestPageHeader;
