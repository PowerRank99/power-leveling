
// Guild-related types
export type GuildRole = 'guild_master' | 'moderator' | 'member';

export interface CreateGuildParams {
  name: string;
  description?: string;
  avatarUrl?: string;
}

export type GuildRaidType = 'consistency' | 'beast' | 'elemental';

export interface CreateRaidParams {
  name: string;
  raidType: GuildRaidType;
  startDate: Date;
  endDate: Date;
  daysRequired: number;
}

export interface RaidProgress {
  currentValue: number;
  targetValue: number;
  percentage: number;
}

export interface RaidDetails {
  participantsCount: number;
  xpReward: number;
  participants?: any[];
  elementalTypes?: string[];
}

export interface RaidWithProgress {
  id: string;
  name: string;
  raidType: GuildRaidType;
  startDate: Date;
  endDate: Date;
  daysRequired: number;
  progress: RaidProgress;
  raidDetails: RaidDetails;
}
