
/**
 * Guild utility functions for common calculations and data mapping
 */
export class GuildUtils {
  /**
   * Calculate guild level based on total XP
   * Every 1000 XP equals one level
   */
  static calculateGuildLevel(totalXp: number): number {
    if (totalXp <= 0) return 1;
    return Math.max(1, Math.floor(totalXp / 1000) + 1);
  }
  
  /**
   * Calculate next level XP requirements
   */
  static calculateNextLevelXP(totalXp: number): { current: number, next: number, percent: number } {
    const currentLevel = this.calculateGuildLevel(totalXp);
    const nextLevelXP = currentLevel * 1000;
    const prevLevelXP = (currentLevel - 1) * 1000;
    const levelProgress = totalXp - prevLevelXP;
    const levelRange = nextLevelXP - prevLevelXP;
    const percent = Math.round((levelProgress / levelRange) * 100);
    
    return {
      current: levelProgress,
      next: levelRange,
      percent: percent
    };
  }
  
  /**
   * Map database guild object to UI guild format
   */
  static mapDatabaseGuildToUIFormat(dbGuild: any): any {
    return {
      id: dbGuild.id,
      name: dbGuild.name,
      description: dbGuild.description || '',
      avatar: dbGuild.avatar_url || "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
      memberCount: dbGuild.memberCount || dbGuild.guild_members?.count || 0,
      level: this.calculateGuildLevel(dbGuild.total_xp || 0),
      questCount: dbGuild.activeRaidsCount || 0,
      isUserGuildMaster: dbGuild.role === 'guild_master',
      totalExp: dbGuild.total_xp || 0
    };
  }
}

export default GuildUtils;
