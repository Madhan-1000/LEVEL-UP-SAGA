import { useQuery } from '@tanstack/react-query';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  domainId?: string;
  domain?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  xpBonus: number;
  type: string;
  requirements: any;
  icon: string;
  grade?: "bronze" | "silver" | "gold" | "platinum";
  difficulty?: "easy" | "standard" | "challenging" | "legendary";
  isUnlocked?: boolean;
  unlockedAt?: string;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  locked: number;
  byType: {
    general: number;
    domain_specific: number;
    level_based: number;
    streak_based: number;
  };
}

export function useAchievements(includeLocked = false, enabled = true) {
  return useQuery({
    queryKey: ['achievements', includeLocked],
    queryFn: async (): Promise<{ achievements: Achievement[]; stats: AchievementStats }> => {
      const params = new URLSearchParams();
      if (includeLocked) params.append('includeLocked', 'true');

      const response = await fetch(`/api/achievements?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      return response.json();
    },
    enabled,
  });
}
