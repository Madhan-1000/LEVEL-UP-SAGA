import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  kind?: string;
  occurredAt: string;
  day: string;
}

export function useTimeline(day?: string) {
  return useQuery({
    queryKey: ["timeline", day ?? "today"],
    queryFn: async () => {
      const params = day ? `?day=${encodeURIComponent(day)}` : "";
      const resp = await fetch(`/api/timeline${params}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load timeline");
      return data.entries as TimelineEntry[];
    },
  });
}

export function useTimelineDays() {
  return useQuery({
    queryKey: ["timeline-days"],
    queryFn: async () => {
      const resp = await fetch("/api/timeline/days");
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load timeline days");
      return (data.days as string[]) ?? [];
    },
  });
}

export function useAddTimelineEntry(day?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      kind?: string;
      occurredAt?: string;
    }) => {
      const resp = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, day }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to add entry");
      return data.entry as TimelineEntry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeline"] });
      qc.invalidateQueries({ queryKey: ["timeline", day ?? "today"] });
      qc.invalidateQueries({ queryKey: ["timeline-days"] });
    },
  });
}

export function useDeleteTimelineEntry(day?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const resp = await fetch("/api/timeline", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to delete entry");
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeline"] });
      qc.invalidateQueries({ queryKey: ["timeline", day ?? "today"] });
      qc.invalidateQueries({ queryKey: ["timeline-days"] });
    },
  });
}
