"use client";

import Link from "next/link";
import { useTimelineDays } from "@/hooks/useTimeline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function formatDay(dayIso: string) {
  const d = new Date(dayIso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function TimelineDaysPage() {
  const { data: days, isLoading } = useTimelineDays();

  return (
    <main className="container mx-auto max-w-3xl py-16 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-orbitron text-2xl">Timeline days</h1>
          <p className="text-muted-foreground text-sm">Browse days with recorded events.</p>
        </div>
        <Link href="/timeline">
          <Button variant="outline">Today</Button>
        </Link>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading days...
          </div>
        ) : !days || days.length === 0 ? (
          <p className="text-muted-foreground text-sm">No timeline days yet.</p>
        ) : (
          <div className="space-y-2">
            {days.map((dayIso) => {
              const dateOnly = dayIso.split("T")[0];
              return (
                <Link key={dayIso} href={`/timeline/${dateOnly}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/60 transition">
                    <div className="font-orbitron text-sm">{formatDay(dayIso)}</div>
                    <span className="text-xs text-muted-foreground">View</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </main>
  );
}
