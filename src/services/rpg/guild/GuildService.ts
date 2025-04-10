
import { CreateGuildService } from './CreateGuildService';
import { JoinGuildService } from './JoinGuildService';
import { GuildRaidService } from './GuildRaidService';
import { GuildQueryService } from './GuildQueryService';

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

// Export a consolidated API for backwards compatibility
export class GuildService {
  /**
   * Creates a new guild
   */
  static async createGuild(userId: string, params: CreateGuildParams): Promise<string | null> {
    return CreateGuildService.createGuild(userId, params);
  }
  
  /**
   * Joins a guild
   */
  static async joinGuild(userId: string, guildId: string): Promise<boolean> {
    return JoinGuildService.joinGuild(userId, guildId);
  }
  
  /**
   * Creates a new guild raid
   */
  static async createRaid(
    guildId: string, 
    creatorId: string, 
    params: CreateRaidParams
  ): Promise<string | null> {
    return GuildRaidService.createRaid(guildId, creatorId, params);
  }
  
  /**
   * Gets a list of guilds for display
   */
  static async listGuilds(limit: number = 20): Promise<any[]> {
    return GuildQueryService.listGuilds(limit);
  }
  
  /**
   * Gets guilds the user is a member of
   */
  static async getUserGuilds(userId: string): Promise<any[]> {
    return GuildQueryService.getUserGuilds(userId);
  }
  
  /**
   * Gets guild leaderboard
   */
  static async getLeaderboard(guildId: string): Promise<any[]> {
    return GuildQueryService.getLeaderboard(guildId);
  }
}

// Re-export the types using the correct syntax
// Use `export type` to fix the isolatedModules error
export type { CreateGuildParams, CreateRaidParams, GuildRole };
