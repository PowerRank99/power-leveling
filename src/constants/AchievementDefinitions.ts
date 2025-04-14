
import { z } from 'zod';
import { AchievementCategory, AchievementRank, Achievement, AchievementRequirement } from '@/types/achievementTypes';

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
  rank: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'Unranked']),
  points: z.number().int().min(1).max(25),
  xpReward: z.number().int().min(10).max(500),
  iconName: z.string(),
  requirementType: z.string(),
  requirementValue: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type AchievementDefinition = z.infer<typeof AchievementDefinitionSchema>;

// Comprehensive achievement definitions organized by category
export const ACHIEVEMENTS = {
  WORKOUTS: {
    FIRST_WORKOUT: {
      id: 'first-workout',
      name: 'Primeiro Treino',
      description: 'Complete seu primeiro treino no PowerLeveling',
      category: 'workout',
      rank: 'E',
      points: 1,
      xpReward: 50,
      iconName: 'dumbbell',
      requirementType: 'workouts_count',
      requirementValue: 1
    },
    WEEKLY_THREE: {
      id: 'weekly-workouts',
      name: 'Trio na Semana',
      description: 'Complete 3 treinos em uma semana',
      category: 'workout',
      rank: 'E',
      points: 1,
      xpReward: 75,
      iconName: 'calendar',
      requirementType: 'weekly_workouts',
      requirementValue: 3
    },
    TOTAL_SEVEN: {
      id: 'total-7',
      name: 'Embalo Fitness',
      description: 'Complete 7 treinos no total',
      category: 'workout',
      rank: 'E',
      points: 1,
      xpReward: 100,
      iconName: 'activity',
      requirementType: 'workouts_count',
      requirementValue: 7
    },
    TOTAL_TEN: {
      id: 'total-10',
      name: 'Dedicação Inicial',
      description: 'Complete 10 treinos no total',
      category: 'workout',
      rank: 'D',
      points: 3,
      xpReward: 150,
      iconName: 'activity',
      requirementType: 'workouts_count',
      requirementValue: 10
    },
    TOTAL_TWENTY_FIVE: {
      id: 'total-25',
      name: 'Persistência',
      description: 'Complete 25 treinos no total',
      category: 'workout',
      rank: 'C',
      points: 5,
      xpReward: 200,
      iconName: 'award',
      requirementType: 'workouts_count',
      requirementValue: 25
    },
    TOTAL_FIFTY: {
      id: 'total-50',
      name: 'Metade do Caminho',
      description: 'Complete 50 treinos no total',
      category: 'workout',
      rank: 'B',
      points: 10,
      xpReward: 250,
      iconName: 'medal',
      requirementType: 'workouts_count',
      requirementValue: 50
    },
    TOTAL_HUNDRED: {
      id: 'total-100',
      name: 'Centenário',
      description: 'Complete 100 treinos no total',
      category: 'workout',
      rank: 'A',
      points: 15,
      xpReward: 300,
      iconName: 'trophy',
      requirementType: 'workouts_count',
      requirementValue: 100
    },
    TOTAL_TWO_HUNDRED: {
      id: 'total-200',
      name: 'Dedicação Lendária',
      description: 'Complete 200 treinos no total',
      category: 'workout',
      rank: 'S',
      points: 25,
      xpReward: 500,
      iconName: 'crown',
      requirementType: 'workouts_count',
      requirementValue: 200
    },
    EARLY_MORNING: {
      id: 'early-morning',
      name: 'Levanta e Racha',
      description: 'Complete um treino antes das 7h da manhã',
      category: 'workout',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'sunrise',
      requirementType: 'workout_time',
      requirementValue: 7
    },
    SIXTY_MINUTE_TEN: {
      id: 'workout-60min-10',
      name: 'Maratonista',
      description: 'Complete 10 treinos com mais de 60 minutos',
      category: 'workout',
      rank: 'C',
      points: 5,
      xpReward: 200,
      iconName: 'clock',
      requirementType: 'long_workouts',
      requirementValue: 10
    }
  },
  
  STREAK: {
    THREE_DAYS: {
      id: 'streak-3',
      name: 'Trinca Poderosa',
      description: 'Treine por 3 dias consecutivos',
      category: 'streak',
      rank: 'E',
      points: 1,
      xpReward: 75,
      iconName: 'flame',
      requirementType: 'streak_days',
      requirementValue: 3
    },
    SEVEN_DAYS: {
      id: 'streak-7',
      name: 'Semana Perfeita',
      description: 'Treine por 7 dias consecutivos',
      category: 'streak',
      rank: 'D',
      points: 3,
      xpReward: 150,
      iconName: 'flame',
      requirementType: 'streak_days',
      requirementValue: 7
    },
    FOURTEEN_DAYS: {
      id: 'streak-14',
      name: 'Duas Semanas de Fogo',
      description: 'Treine por 14 dias consecutivos',
      category: 'streak',
      rank: 'C',
      points: 5,
      xpReward: 200,
      iconName: 'flame',
      requirementType: 'streak_days',
      requirementValue: 14
    },
    THIRTY_DAYS: {
      id: 'streak-30',
      name: 'Um Mês Invicto',
      description: 'Treine por 30 dias consecutivos',
      category: 'streak',
      rank: 'B',
      points: 10,
      xpReward: 300,
      iconName: 'flame',
      requirementType: 'streak_days',
      requirementValue: 30
    },
    SIXTY_DAYS: {
      id: 'streak-60',
      name: 'Dois Meses Implacáveis',
      description: 'Treine por 60 dias consecutivos',
      category: 'streak',
      rank: 'A',
      points: 15,
      xpReward: 400,
      iconName: 'flame',
      requirementType: 'streak_days',
      requirementValue: 60
    },
    HUNDRED_DAYS: {
      id: 'streak-100',
      name: 'Centenário do Fogo',
      description: 'Treine por 100 dias consecutivos',
      category: 'streak',
      rank: 'S',
      points: 20,
      xpReward: 500,
      iconName: 'flame',
      requirementType: 'streak_days',
      requirementValue: 100
    },
    YEAR_STREAK: {
      id: 'streak-365',
      name: 'Um Ano de Lenda',
      description: 'Treine por 365 dias consecutivos',
      category: 'streak',
      rank: 'S',
      points: 25,
      xpReward: 1000,
      iconName: 'crown',
      requirementType: 'streak_days',
      requirementValue: 365
    }
  },
  
  RECORDS: {
    FIRST_PR: {
      id: 'pr-first',
      name: 'Quebra-Recorde',
      description: 'Estabeleça seu primeiro recorde pessoal',
      category: 'record',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'trending-up',
      requirementType: 'pr_count',
      requirementValue: 1
    },
    FIVE_PR: {
      id: 'pr-5',
      name: 'Quebrando Barreiras',
      description: 'Estabeleça 5 recordes pessoais',
      category: 'record',
      rank: 'D',
      points: 3,
      xpReward: 125,
      iconName: 'trending-up',
      requirementType: 'pr_count',
      requirementValue: 5
    },
    TEN_PR: {
      id: 'pr-10',
      name: 'Recordista Experiente',
      description: 'Estabeleça 10 recordes pessoais',
      category: 'record',
      rank: 'C',
      points: 5,
      xpReward: 150,
      iconName: 'trending-up',
      requirementType: 'pr_count',
      requirementValue: 10
    },
    TWENTY_FIVE_PR: {
      id: 'pr-25',
      name: 'Recordista Dedicado',
      description: 'Estabeleça 25 recordes pessoais',
      category: 'record',
      rank: 'B',
      points: 10,
      xpReward: 200,
      iconName: 'trending-up',
      requirementType: 'pr_count',
      requirementValue: 25
    },
    FIFTY_PR: {
      id: 'pr-50',
      name: 'Mestre dos Recordes',
      description: 'Estabeleça 50 recordes pessoais',
      category: 'record',
      rank: 'A',
      points: 15,
      xpReward: 300,
      iconName: 'trending-up',
      requirementType: 'pr_count',
      requirementValue: 50
    }
  },
  
  GUILD: {
    FIRST_GUILD: {
      id: 'first-guild',
      name: 'Primeira Guilda',
      description: 'Junte-se à sua primeira guilda',
      category: 'guild',
      rank: 'E',
      points: 1,
      xpReward: 50,
      iconName: 'users',
      requirementType: 'guild_count',
      requirementValue: 1
    },
    FIRST_QUEST: {
      id: 'guild-quest-first',
      name: 'Quest de Guilda',
      description: 'Participe da sua primeira missão de guilda',
      category: 'guild',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'map',
      requirementType: 'guild_quest_count',
      requirementValue: 1
    },
    THREE_GUILDS: {
      id: 'multiple-guilds',
      name: 'Amigo de Guilda',
      description: 'Junte-se a 3 ou mais guildas',
      category: 'guild',
      rank: 'D',
      points: 3,
      xpReward: 150,
      iconName: 'users',
      requirementType: 'guild_count',
      requirementValue: 3
    },
    THREE_QUESTS: {
      id: 'guild-quest-3',
      name: 'Power Guildo',
      description: 'Participe de 3 missões de guilda',
      category: 'guild',
      rank: 'C',
      points: 5,
      xpReward: 200,
      iconName: 'map',
      requirementType: 'guild_quest_count',
      requirementValue: 3
    }
  },
  
  MANUAL: {
    FIRST_MANUAL: {
      id: 'manual-first',
      name: 'Esporte de Primeira',
      description: 'Registre seu primeiro treino manual',
      category: 'manual',
      rank: 'E',
      points: 1,
      xpReward: 50,
      iconName: 'camera',
      requirementType: 'manual_count',
      requirementValue: 1
    },
    FIVE_MANUAL: {
      id: 'manual-5',
      name: 'Aventuras Fitness',
      description: 'Registre 5 treinos manuais',
      category: 'manual',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'camera',
      requirementType: 'manual_count',
      requirementValue: 5
    },
    TEN_MANUAL: {
      id: 'manual-10',
      name: 'Manual na Veia',
      description: 'Registre 10 treinos manuais',
      category: 'manual',
      rank: 'C',
      points: 5,
      xpReward: 150,
      iconName: 'camera',
      requirementType: 'manual_count',
      requirementValue: 10
    },
    TWENTY_FIVE_MANUAL: {
      id: 'manual-25',
      name: 'Explorador Fitness',
      description: 'Registre 25 treinos manuais',
      category: 'manual',
      rank: 'B',
      points: 10,
      xpReward: 200,
      iconName: 'camera',
      requirementType: 'manual_count',
      requirementValue: 25
    }
  },
  
  VARIETY: {
    THREE_TYPES: {
      id: 'variety-3',
      name: 'Combo Fitness',
      description: 'Faça 1 treino cardio, 1 força e 1 mobilidade',
      category: 'variety',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'layers',
      requirementType: 'exercise_types',
      requirementValue: 3
    },
    THREE_WORKOUTS: {
      id: 'workout-types-3',
      name: 'Aventuras Fitness',
      description: 'Registre 3 tipos diferentes de treinos',
      category: 'variety',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'shuffle',
      requirementType: 'workout_types',
      requirementValue: 3
    },
    FOUR_TYPES_WEEKLY: {
      id: 'workout-types-weekly-4',
      name: 'Semana Multitarefa',
      description: 'Faça 4 tipos de treinos em uma única semana',
      category: 'variety',
      rank: 'C',
      points: 5,
      xpReward: 150,
      iconName: 'calendar',
      requirementType: 'weekly_variety',
      requirementValue: 4
    },
    FIVE_TYPES: {
      id: 'variety-5',
      name: 'Experiência Completa',
      description: 'Pratique 5 tipos diferentes de exercícios',
      category: 'variety',
      rank: 'C',
      points: 5,
      xpReward: 150,
      iconName: 'layers',
      requirementType: 'exercise_types',
      requirementValue: 5
    },
    TEN_TYPES: {
      id: 'variety-10',
      name: 'Enciclopédia Fitness',
      description: 'Pratique 10 tipos diferentes de exercícios',
      category: 'variety',
      rank: 'B',
      points: 10,
      xpReward: 200,
      iconName: 'layers',
      requirementType: 'exercise_types',
      requirementValue: 10
    }
  },
  
  LEVEL: {
    LEVEL_10: {
      id: 'level-10',
      name: 'Subida Poderosa',
      description: 'Atinja o nível 10',
      category: 'level',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'arrow-up',
      requirementType: 'level',
      requirementValue: 10
    },
    LEVEL_25: {
      id: 'level-25',
      name: 'Dedicação Total',
      description: 'Atinja o nível 25',
      category: 'level',
      rank: 'C',
      points: 5,
      xpReward: 150,
      iconName: 'arrow-up',
      requirementType: 'level',
      requirementValue: 25
    },
    LEVEL_50: {
      id: 'level-50',
      name: 'Meio Caminho',
      description: 'Atinja o nível 50',
      category: 'level',
      rank: 'B',
      points: 10,
      xpReward: 200,
      iconName: 'arrow-up',
      requirementType: 'level',
      requirementValue: 50
    },
    LEVEL_75: {
      id: 'level-75',
      name: 'Quase Lá',
      description: 'Atinja o nível 75',
      category: 'level',
      rank: 'A',
      points: 15,
      xpReward: 300,
      iconName: 'arrow-up',
      requirementType: 'level',
      requirementValue: 75
    },
    LEVEL_99: {
      id: 'level-99',
      name: 'O Ápice',
      description: 'Atinja o nível máximo de 99',
      category: 'level',
      rank: 'S',
      points: 25,
      xpReward: 500,
      iconName: 'award',
      requirementType: 'level',
      requirementValue: 99
    }
  },
  
  XP: {
    XP_1000: {
      id: 'xp-1000',
      name: 'Primeiro Milhar',
      description: 'Acumule 1.000 XP',
      category: 'xp',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'trending-up',
      requirementType: 'total_xp',
      requirementValue: 1000
    },
    XP_5000: {
      id: 'xp-5000',
      name: 'Cinco Mil',
      description: 'Acumule 5.000 XP',
      category: 'xp',
      rank: 'C',
      points: 5,
      xpReward: 150,
      iconName: 'trending-up',
      requirementType: 'total_xp',
      requirementValue: 5000
    },
    XP_10000: {
      id: 'xp-10000',
      name: 'Dez Mil',
      description: 'Acumule 10.000 XP',
      category: 'xp',
      rank: 'B',
      points: 10,
      xpReward: 200,
      iconName: 'trending-up',
      requirementType: 'total_xp',
      requirementValue: 10000
    },
    XP_50000: {
      id: 'xp-50000',
      name: 'Cinquenta Mil',
      description: 'Acumule 50.000 XP',
      category: 'xp',
      rank: 'A',
      points: 15,
      xpReward: 300,
      iconName: 'trending-up',
      requirementType: 'total_xp',
      requirementValue: 50000
    },
    XP_100000: {
      id: 'xp-100000',
      name: 'Cem Mil',
      description: 'Acumule 100.000 XP',
      category: 'xp',
      rank: 'S',
      points: 25,
      xpReward: 500,
      iconName: 'trending-up',
      requirementType: 'total_xp',
      requirementValue: 100000
    }
  },
  
  SPECIAL: {
    SUPREME_POWER: {
      id: 'supreme-power',
      name: 'Poder Supremo',
      description: 'Desbloqueie todas as outras conquistas',
      category: 'special',
      rank: 'S',
      points: 25,
      xpReward: 1000,
      iconName: 'crown',
      requirementType: 'all_achievements',
      requirementValue: 1
    }
  }
};

export const AchievementUtils = {
  /**
   * Validate an achievement definition
   */
  validateAchievement(achievement: AchievementDefinition): boolean {
    try {
      AchievementDefinitionSchema.parse(achievement);
      return true;
    } catch (error) {
      console.error('Invalid achievement definition:', error);
      return false;
    }
  },
  
  /**
   * Get all achievement definitions as a flat array
   */
  getAllAchievements(): AchievementDefinition[] {
    const allAchievements: AchievementDefinition[] = [];
    
    Object.values(ACHIEVEMENTS).forEach(category => {
      Object.values(category).forEach(achievement => {
        if (this.validateAchievement(achievement as AchievementDefinition)) {
          allAchievements.push(achievement as AchievementDefinition);
        }
      });
    });
    
    return allAchievements;
  },
  
  /**
   * Get achievement by ID with optional validation
   */
  getAchievementById(id: string, validateDefinition = true): AchievementDefinition | undefined {
    const achievement = this.getAllAchievements().find(a => a.id === id);
    
    if (achievement && (!validateDefinition || this.validateAchievement(achievement))) {
      return achievement;
    }
    
    return undefined;
  },
  
  /**
   * Get achievements by rank
   */
  getAchievementsByRank(rank: AchievementRank, validateDefinition = true): AchievementDefinition[] {
    return this.getAllAchievements().filter(achievement => 
      achievement.rank === rank && 
      (!validateDefinition || this.validateAchievement(achievement))
    );
  },
  
  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory, validateDefinition = true): AchievementDefinition[] {
    return this.getAllAchievements().filter(achievement => 
      achievement.category === category && 
      (!validateDefinition || this.validateAchievement(achievement))
    );
  },
  
  /**
   * Get achievement requirements
   */
  getAchievementRequirements(id: string): { type: string, value: number } | undefined {
    const achievement = this.getAchievementById(id);
    
    if (achievement) {
      return {
        type: achievement.requirementType,
        value: achievement.requirementValue
      };
    }
    
    return undefined;
  },
  
  /**
   * Get achievement points by rank
   */
  getPointsByRank(rank: AchievementRank): number {
    const pointsMap: Record<AchievementRank, number> = {
      'S': 25,
      'A': 15,
      'B': 10,
      'C': 5,
      'D': 3,
      'E': 1,
      'Unranked': 0
    };
    
    return pointsMap[rank] || 0;
  },
  
  /**
   * Convert AchievementDefinition to Achievement interface
   * Provides a standardized way to convert between the two formats
   */
  convertToAchievement(definition: AchievementDefinition): Achievement {
    return {
      id: definition.id,
      name: definition.name,
      description: definition.description,
      category: definition.category as AchievementCategory,
      rank: definition.rank as AchievementRank,
      points: definition.points,
      xpReward: definition.xpReward,
      iconName: definition.iconName,
      requirements: {
        type: definition.requirementType,
        value: definition.requirementValue,
        metadata: definition.metadata
      },
      metadata: definition.metadata
    };
  },
  
  /**
   * Convert Achievement to AchievementDefinition
   */
  convertToDefinition(achievement: Achievement): AchievementDefinition {
    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      rank: achievement.rank,
      points: achievement.points,
      xpReward: achievement.xpReward,
      iconName: achievement.iconName,
      requirementType: achievement.requirements.type,
      requirementValue: achievement.requirements.value,
      metadata: achievement.metadata
    };
  }
};
