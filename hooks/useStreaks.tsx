import { useQuery } from '@tanstack/react-query';

export interface Streak {
  id: string;
  domain_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useStreaks() {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: async () => {
      // Replace with mock data or alternative logic
      return [];
    },
  });
}
