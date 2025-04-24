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

// New interfaces to match database schema
export type GuildRaidType = 'consistency' | 'beast' | 'elemental';

export interface RaidProgress {
  completed: boolean;
  currentValue: number;
  targetValue: number;
  percentage: number;
}

export interface RaidWithProgress {
  id: string;
  name: string;
  guildId: string;
  raidType: GuildRaidType;
  startDate: Date;
  endDate: Date;
  daysRequired: number;
  raidDetails: RaidDetails;
  progress: RaidProgress;
}

export interface RaidDetails {
  description?: string;
  targetValue?: number;
  elementalTypes?: string[];
  xpReward?: number;
  bossName?: string;
}

export interface GuildXPContribution {
  id: string;
  guildId: string;
  userId: string;
  amount: number;
  rawAmount: number;
  bonusAmount: number;
  source: string;
  workoutId?: string;
  manualWorkoutId?: string;
  createdAt: Date;
}

export interface GuildLeaderboardEntry {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  level: number;
  class: string | null;
  totalXp: number;
  workoutsCount: number;
  role: GuildRole;
}

export interface GuildStats {
  memberCount: number;
  activeRaidsCount: number;
  totalXp: number;
}
