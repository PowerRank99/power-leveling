
import { z } from 'zod';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';

/**
 * Zod schema for validating achievement definitions
 */
export const AchievementDefinitionSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.nativeEnum(AchievementCategory),
  rank: z.nativeEnum(AchievementRank),
  points: z.number().int().positive(),
  xpReward: z.number().int().nonnegative(),
  iconName: z.string(),
  requirementType: z.string(),
  requirementValue: z.number(),
  metadata: z.record(z.any()).optional()
});

/**
 * TypeScript type for achievement definitions
 */
export type AchievementDefinition = z.infer<typeof AchievementDefinitionSchema>;
