
import { useNavigate } from 'react-router-dom';

export const useGuildNavigation = (guildId: string) => {
  const navigate = useNavigate();
  
  return {
    goToLeaderboard: () => navigate(`/guilds/${guildId}/leaderboard`),
    goToQuests: () => navigate(`/guilds/${guildId}/quests`),
    goToRaids: () => navigate(`/guilds/${guildId}/raids`),
    goToGuildsList: () => navigate('/guilds'),
    goToCreateGuild: () => navigate('/guilds/create'),
  };
};

export default useGuildNavigation;
