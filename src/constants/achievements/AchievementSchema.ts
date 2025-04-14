
import { z } from 'zod';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';

// Enhanced Achievement Definition Schema with Zod for runtime validation
export const AchievementDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z]+(-[a-z]+)*$/, "ID must be lowercase with optional hyphen separators"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    AchievementCategory.WORKOUT,
    AchievementCategory.STREAK, 
    AchievementCategory.RECORD, 
    AchievementCategory.XP, 
    AchievementCategory.LEVEL, 
    AchievementCategory.GUILD, 
    AchievementCategory.SPECIAL, 
    AchievementCategory.VARIETY, 
    AchievementCategory.MANUAL,
    AchievementCategory.TIME_BASED,
    AchievementCategory.MILESTONE
  ]),
  rank: z.enum([
    AchievementRank.S,
    AchievementRank.A,
    AchievementRank.B,
    AchievementRank.C,
    AchievementRank.D,
    AchievementRank.E,
    AchievementRank.UNRANKED
  ]),
  points: z.number().int().min(1).max(25),
  xpReward: z.number().int().min(10).max(500),
  iconName: z.string(),
  requirementType: z.string(),
  requirementValue: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type AchievementDefinition = z.infer<typeof AchievementDefinitionSchema>;
