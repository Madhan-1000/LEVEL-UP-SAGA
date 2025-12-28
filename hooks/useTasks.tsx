import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Task {
  id: string;
  userId: string;
  templateId: string;
  status: "pending" | "active" | "completed" | "failed" | "cheated";
  assignedAt: string;
  startedAt?: string;
  deadlineAt?: string;
  completedAt?: string;
  result?: "success" | "failure" | "timeout" | "cheated";
  completionSpeed?: number;
  flaggedAsCheat: boolean;
  userRating?: number;
  reviewNotes?: string;
  template: {
    id: string;
    name: string;
    description: string;
    xpReward: number;
    difficulty: string;
    taskType: string;
    config?: any;
    domain: {
      id: string;
      name: string;
      description: string;
      icon: string;
      color: string;
    };
  };
}

export function useTasks(status?: string, domainId?: string, limit = 50, offset = 0) {
return useQuery({
    queryKey: ["tasks", status, domainId, limit, offset],
    queryFn: async () => {
      const response = await fetch(
        `/api/tasks?status=${status ?? ""}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch tasks");
      }

      const data = await response.json();

      // ✅ supports both: { tasks: [...] } and [...]
      return Array.isArray(data) ? data : (data.tasks ?? []);
    },
    // optional: consider removing enabled gating if you still have it
    // enabled: true,
  });
}

export function useAssignTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/tasks/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to assign tasks");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}


export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      taskId: string
      completedAt?: string
      userRating?: number
      reviewNotes?: string
    }) => {
      const { taskId, completedAt, userRating, reviewNotes } = input

      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completedAt, userRating, reviewNotes }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error ?? "Failed to complete task")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["progress"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      queryClient.invalidateQueries({ queryKey: ["achievements"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}
