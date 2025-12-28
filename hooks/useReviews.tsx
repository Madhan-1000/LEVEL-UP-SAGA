import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DailyReview {
  id: string;
  userId: string;
  date: string;
  overallSatisfaction: number;
  tasksCompleted: number;
  tasksFailed: number;
  reflectionNotes?: string;
  createdAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageSatisfaction: number;
  totalTasksCompleted: number;
  totalTasksFailed: number;
  completionRate: number;
  streakDays: number;
}

export function useReviews(limit = 30, offset = 0) {
  return useQuery({
    queryKey: ['reviews', limit, offset],
    queryFn: async (): Promise<{ reviews: DailyReview[]; stats: ReviewStats; pagination: any }> => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/reviews?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: {
      date: string;
      overallSatisfaction: number;
      reflectionNotes?: string;
    }) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create review');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
