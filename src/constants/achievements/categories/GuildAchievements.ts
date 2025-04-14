
import { AchievementCategory } from '@/types/achievementTypes';

export const GUILD_ACHIEVEMENTS = {
  FIRST_GUILD: {
    id: 'first-guild',
    name: 'Primeira Guilda',
    description: 'Junte-se à sua primeira guilda',
    category: AchievementCategory.GUILD,
    rank: 'E',
    points: 1,
    xpReward: 50,
    iconName: 'users',
    requirementType: 'guild_count',
    requirementValue: 1
  },
  FIRST_QUEST: {
    id: 'guild-quest-first',
    name: 'Quest de Guilda',
    description: 'Participe da sua primeira missão de guilda',
    category: AchievementCategory.GUILD,
    rank: 'D',
    points: 3,
    xpReward: 100,
    iconName: 'map',
    requirementType: 'guild_quest_count',
    requirementValue: 1
  },
  THREE_GUILDS: {
    id: 'multiple-guilds',
    name: 'Amigo de Guilda',
    description: 'Junte-se a 3 ou mais guildas',
    category: AchievementCategory.GUILD,
    rank: 'D',
    points: 3,
    xpReward: 150,
    iconName: 'users',
    requirementType: 'guild_count',
    requirementValue: 3
  },
  THREE_QUESTS: {
    id: 'guild-quest-3',
    name: 'Power Guildo',
    description: 'Participe de 3 missões de guilda',
    category: AchievementCategory.GUILD,
    rank: 'C',
    points: 5,
    xpReward: 200,
    iconName: 'map',
    requirementType: 'guild_quest_count',
    requirementValue: 3
  }
};
