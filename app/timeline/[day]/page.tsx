"use client";

import { useMemo, useState, use } from "react";
import Link from "next/link";
import { useTimeline, useAddTimelineEntry, useDeleteTimelineEntry } from "@/hooks/useTimeline";
import { Timeline } from "@/components/Timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function localDateString(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function isTodayLocal(dayParam: string) {
  if (!dayParam) return false;
  return dayParam === localDateString(new Date());
}

export default function TimelineDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = use(params);
  const dayParam = decodeURIComponent(day);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => `${dayParam}T12:00`);

  const { data: entries, isLoading } = useTimeline(dayParam);
  const addMutation = useAddTimelineEntry(dayParam);
  const deleteMutation = useDeleteTimelineEntry(dayParam);

  const sortedEntries = useMemo(() => {
    return (entries ?? []).slice().sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  }, [entries]);

  const canAdd = isTodayLocal(dayParam);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Deleted", description: "Timeline entry removed." });
    } catch (err: any) {
      toast({ title: "Could not delete", description: err?.message || "Try again." });
    }
  };

  const handleAdd = async () => {
    if (!canAdd) return;
    if (!title.trim()) {
      toast({ title: "Title required", description: "Add a short label." });
      return;
    }
    try {
      await addMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        occurredAt: new Date(occurredAt).toISOString(),
      });
      setTitle("");
      setDescription("");
      setOccurredAt(`${dayParam}T12:00`);
      toast({ title: "Added", description: "Timeline entry saved." });
    } catch (err: any) {
      toast({ title: "Could not add entry", description: err?.message || "Try again." });
    }
  };

  return (
    <main className="container mx-auto max-w-4xl py-16 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-orbitron text-2xl">Timeline for {dayParam}</h1>
          <p className="text-muted-foreground text-sm">Events for this day.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/timeline/days">
            <Button variant="outline">All days</Button>
          </Link>
          <Link href="/timeline">
            <Button variant="default">Today</Button>
          </Link>
        </div>
      </div>

      {canAdd && (
        <Card className="p-4 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Input
                placeholder="Title (e.g., Morning workout)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Optional details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Time</label>
              <Input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
              <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full gap-2">
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add entry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!canAdd && (
        <Card className="p-4 mb-8">
          <p className="text-sm text-muted-foreground">
            This day is locked. Entries cannot be added after the day is over.
          </p>
        </Card>
      )}

      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading timeline...
          </div>
        ) : (
          <Timeline entries={sortedEntries} onDelete={handleDelete} />
        )}
      </Card>
    </main>
  );
}
