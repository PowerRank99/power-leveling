
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
