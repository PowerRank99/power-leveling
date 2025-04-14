
import { toast } from 'sonner';
import { AchievementService } from '@/services/rpg/AchievementService';

export type GuildRole = 'member' | 'moderator' | 'guild_master';

export interface CreateGuildParams {
  name: string;
  description?: string;
  avatarUrl?: string;
}

export interface CreateRaidParams {
  name: string;
  description?: string;
  startDate?: Date;
  endDate: Date;
  daysRequired: number;
}

// Export toast and AchievementService to be used in guild service
export { toast, AchievementService };
