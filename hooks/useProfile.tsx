import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export { calculateLevel } from "@/lib/game-logic";

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  current_level: number;
  current_xp: number;
  total_xp: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/progress');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      // Replace with mock data or alternative logic
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUserDomains() {
  return useQuery({
    queryKey: ['user-domains'],
    queryFn: async () => {
      const response = await fetch('/api/domains');
      if (!response.ok) {
        throw new Error('Failed to fetch user domains');
      }
      const data = await response.json();
      return data.userDomains ?? [];
    },
  });
}
