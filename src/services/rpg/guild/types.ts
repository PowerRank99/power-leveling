
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
