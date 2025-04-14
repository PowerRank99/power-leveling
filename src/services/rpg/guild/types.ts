
/**
 * Response type for guild member data
 */
export interface GuildMemberResponse {
  id: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  role: string;
  joinedAt: string;
  xp: number;
  workoutsCount: number;
  streak: number;
}

/**
 * Guild data response
 */
export interface GuildResponse {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  createdAt: string;
  creatorId: string | null;
  memberCount?: number;
  role?: string;
}

/**
 * Guild raid response
 */
export interface GuildRaidResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  daysRequired: number;
  createdBy: string;
  createdAt: string;
  guildId: string;
  isActive: boolean;
  isCompleted: boolean;
  currentProgress?: number;
  totalParticipants?: number;
}

/**
 * Guild raid participant response
 */
export interface GuildRaidParticipantResponse {
  id: string;
  userId: string;
  daysCompleted: number;
  completed: boolean;
  userInfo?: {
    name: string;
    avatarUrl: string | null;
    level: number;
  };
}
