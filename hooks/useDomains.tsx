import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  locked?: boolean;
}

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    // hooks/useDomains.ts
queryFn: async () => {
  const response = await fetch('/api/domains');
  
  if (!response.ok) {
    throw new Error("Failed to fetch domains");
  }

  const data = await response.json();
  return data.domains ?? [];
}
,
  });
}

export function useUserDomains() {
  return useQuery({
    queryKey: ['user-domains'],
    queryFn: async (): Promise<(Domain & { locked?: boolean })[]> => {
      const response = await fetch('/api/domains');
      if (!response.ok) {
        throw new Error('Failed to fetch user domains');
      }
      const data = await response.json();
      return data.userDomains ?? [];
    },
  });
}

export function useSelectDomains() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainIds: string[]) => {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to select domains');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-domains'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
