
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rank: string;
  points: number;
  xp_reward: number;
  icon_name: string;
  requirements: any;
  string_id: string;
  unlocked?: boolean;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  points: number;
  rank: string;
  nextRank: string | null;
  pointsToNextRank: number | null;
  rankScore: number;
}
