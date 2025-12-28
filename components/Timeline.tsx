"use client";

import { Fragment } from "react";
import { TimelineEntry } from "@/hooks/useTimeline";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface Props {
  entries: TimelineEntry[];
  align?: "left" | "alternate" | "right"; // default alternate
  onDelete?: (id: string) => Promise<void> | void;
}

export function Timeline({ entries, align = "alternate", onDelete }: Props) {
  return (
    <div className="relative">
      {/* Center spine */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/70 hidden sm:block" />

      {entries.length === 0 && (
        <div className="text-muted-foreground text-sm">No timeline events yet.</div>
      )}

      <div className="space-y-10">
        {entries.map((entry, idx) => {
          const isLeft = align === "left" ? true : align === "right" ? false : idx % 2 === 0;
          const timeLabel = new Date(entry.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return (
            <div key={entry.id} className="relative py-4 sm:py-6">
              {/* Dot on the spine */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1">
                <div className="w-3 h-3 bg-primary border border-background shadow" />
              </div>

              <div
                className={cn(
                  "sm:w-1/2 flex flex-col gap-2",
                  isLeft ? "sm:pr-12 sm:text-right sm:ml-0 sm:mr-auto" : "sm:pl-12 sm:text-left sm:ml-auto"
                )}
              >
                <div className="inline-flex items-center gap-2 text-[11px] uppercase text-muted-foreground font-mono-tech">
                  <span className="w-2.5 h-2.5 bg-primary inline-block" />
                  {timeLabel}
                </div>
                <div className="rounded-none border border-border bg-card shadow-sm p-4">
                  <div className="font-orbitron text-base text-foreground">{entry.title}</div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{entry.description}</p>
                  )}
                  {entry.kind && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-secondary mt-2">
                      <span className="w-2.5 h-2.5 bg-secondary inline-block" />
                      {entry.kind}
                    </span>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-destructive mt-3 hover:underline"
                      onClick={() => onDelete(entry.id)}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
