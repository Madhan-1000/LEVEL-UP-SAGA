import { useQuery } from '@tanstack/react-query';

export interface AnalyticsData {
  timeframe: string;
  stats: {
    tasks: {
      total: number;
      completed: number;
      failed: number;
      cheated: number;
      completionRate: number;
      dailyBreakdown: any[];
    };
    domains: {
      breakdown: Array<{ domain: string; count: number }>;
      topDomain: string | null;
      totalDomains: number;
    };
    streaks: {
      current: number;
      longest: number;
      averageCompletionRate: number;
      reviewConsistency: number;
    };
    achievements: {
      total: number;
      unlocked: number;
      locked: number;
      recentUnlocks: number;
      unlockRate: number;
    };
  };
  insights: Array<{
    type: 'warning' | 'success' | 'info' | 'motivation' | 'goal';
    title: string;
    message: string;
    suggestion?: string;
  }>;
  user: {
    level: number;
    totalXp: number;
    domains: number;
  };
}

export function useAnalytics(timeframe: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['analytics', timeframe],
    queryFn: async (): Promise<AnalyticsData> => {
      const params = new URLSearchParams({ timeframe });

      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
  });
}
