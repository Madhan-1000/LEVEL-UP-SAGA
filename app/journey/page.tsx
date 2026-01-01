"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useAchievements } from "@/hooks/useAchievements";
import { useTasks } from "@/hooks/useTasks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Flame, Clock, ListChecks } from "lucide-react";
import { GridBackground } from "@/components/GridBackground";
import { cn } from "@/lib/utils";

export default function JourneyPage() {
  const { data: profile } = useProfile();
  const { data: achievementsData } = useAchievements();
  const { data: completedTasks } = useTasks("completed", undefined, 50, 0);

  const recentTasks = useMemo(() => {
    if (!completedTasks) return [] as any[];
    return completedTasks
      .slice()
      .sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
      .slice(0, 12);
  }, [completedTasks]);

  const unlocked = achievementsData?.achievements.filter((a: any) => a.isUnlocked) ?? [];
  const locked = achievementsData?.achievements.filter((a: any) => !a.isUnlocked) ?? [];

  return (
    <GridBackground>
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-10">
          <header className="space-y-3 text-center">
            <p className="text-sm font-mono-tech text-primary uppercase tracking-[0.2em]">Journey Log</p>
            <h1 className="font-orbitron text-4xl font-bold text-foreground">Your Progress Trail</h1>
            <p className="text-muted-foreground font-rajdhani max-w-2xl mx-auto">
              Review your XP gains, streak momentum, and achievements unlocked along the way.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card variant="cyber" className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-mono-tech">XP & Level</p>
                    <p className="font-orbitron text-2xl font-bold">
                      Level {profile?.progress?.currentLevel ?? profile?.levelInfo?.level ?? 1}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono-tech">
                  {profile?.progress?.totalXpEarned ?? 0} XP total
                </Badge>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-sm font-rajdhani">
                {[ 
                  { label: "Current XP", value: profile?.progress?.currentXp ?? 0 },
                  { label: "XP to next", value: profile?.levelInfo?.xpToNext ?? 0 },
                  { label: "Longest streak", value: profile?.progress?.longestStreak ?? 0 },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-lg border border-border bg-card/70">
                    <p className="text-muted-foreground text-xs uppercase">{stat.label}</p>
                    <p className="text-lg font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-secondary" />
                <h2 className="font-orbitron font-semibold">Recent completions</h2>
              </div>
              {recentTasks.length ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {recentTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border border-border/70 bg-card/60 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-orbitron text-sm text-foreground line-clamp-1">
                          {task.template?.name ?? "Task"}
                        </span>
                        <Badge variant="outline" className="font-mono-tech text-xs">
                          +{task.template?.xpReward ?? 0} XP
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-rajdhani line-clamp-2">
                        {task.template?.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono-tech">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {task.template?.domain?.name ?? "Domain"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-rajdhani">No completed tasks yet.</p>
              )}
            </Card>

            <div className="space-y-4">
              <Card variant="cyber" className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <h2 className="font-orbitron font-semibold">Achievements</h2>
                </div>
                <p className="text-sm text-muted-foreground font-rajdhani mb-3">
                  {unlocked.length} unlocked / {unlocked.length + locked.length} total
                </p>
                <div className="flex flex-wrap gap-2">
                  {unlocked.slice(0, 12).map((a: any) => (
                    <Badge key={a.id} className={cn("font-mono-tech", "border-amber-300 bg-amber-100 text-amber-900")}> 
                      {a.name}
                    </Badge>
                  ))}
                  {!unlocked.length && (
                    <p className="text-xs text-muted-foreground font-rajdhani">Unlock achievements as you progress.</p>
                  )}
                </div>
                <Link href="/achievements">
                  <Button variant="ghost" size="sm" className="w-full mt-4 font-orbitron">
                    View all achievements
                  </Button>
                </Link>
              </Card>

              <Card variant="cyber" className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-primary" />
                  <h2 className="font-orbitron font-semibold">Streak health</h2>
                </div>
                <div className="space-y-2 text-sm font-rajdhani">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current streak</span>
                    <span className="font-mono-tech font-bold">{profile?.progress?.currentStreak ?? 0} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Longest streak</span>
                    <span className="font-mono-tech font-bold">{profile?.progress?.longestStreak ?? 0} days</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </GridBackground>
  );
}
