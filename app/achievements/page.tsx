"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserDomains } from "@/hooks/useDomains";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { GridBackground } from "@/components/GridBackground";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const gradeVisual: Record<
  "bronze" | "silver" | "gold" | "platinum",
  { border: string; overlay: string; badge: string }
> = {
  bronze: {
    border: "border-amber-500/70",
    overlay: "from-amber-500/10 via-amber-700/10 to-transparent",
    badge: "text-amber-100 bg-amber-900/60 border border-amber-500/60",
  },
  silver: {
    border: "border-white/70",
    overlay: "from-white/20 via-slate-200/15 to-transparent",
    badge: "text-slate-900 bg-white/70 border border-slate-200/70",
  },
  gold: {
    border: "border-amber-300/80 shadow-[0_0_10px_rgba(251,191,36,0.25)]",
    overlay: "from-amber-300/18 via-amber-200/14 to-transparent",
    badge: "text-amber-950 bg-amber-200/80 border border-amber-300/80",
  },
  platinum: {
    border: "border-white shadow-[0_0_12px_rgba(255,255,255,0.45)]",
    overlay: "from-white/35 via-white/18 to-transparent",
    badge: "text-slate-900 bg-white/85 border border-white/80",
  },
};

const difficultyCopy: Record<"easy" | "standard" | "challenging" | "legendary", string> = {
  easy: "Low friction",
  standard: "Steady",
  challenging: "Hard",
  legendary: "Legendary",
};

function requirementLabel(achievement: any) {
  const req = achievement.requirements as any;
  switch (req?.type) {
    case "completedTasks":
      return `Complete ${req.count} tasks total`;
    case "streak":
      return `Reach a ${req.minStreak}-day streak`;
    case "level":
      return `Reach level ${req.minLevel}`;
    case "domainTasks":
      return `Complete ${req.minDomainTasks ?? req.count} tasks in ${achievement.domain?.name ?? req.domainName ?? "this domain"}`;
    default:
      return "Keep progressing";
  }
}

export default function AchievementsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { data, isLoading } = useAchievements(true, isLoaded && !!user);
  const { data: userDomains } = useUserDomains();

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/auth/sign-in?redirect_url=/achievements");
    }
  }, [isLoaded, user, router]);

  const domainsLoaded = Array.isArray(userDomains);

  const selectedDomainNames = useMemo(() => {
    if (!domainsLoaded) return [] as string[];
    return (userDomains ?? []).map((d: any) => d.domain?.name).filter(Boolean);
  }, [userDomains, domainsLoaded]);

  const achievements = useMemo(() => {
    const list = data?.achievements ?? [];
    if (!domainsLoaded) return [] as any[]; // wait for domains before showing
    if (!selectedDomainNames.length) {
      // No selected domains: show only non-domain achievements
      return list.filter((a: any) => !a.domain?.name);
    }
    const selectedLower = selectedDomainNames.map((n) => n.toLowerCase());
    return list.filter((a: any) => {
      if (!a.domain?.name) return true; // general/level/streak stay visible
      return selectedLower.includes(a.domain.name.toLowerCase());
    });
  }, [data?.achievements, selectedDomainNames, domainsLoaded]);
  const unlockedCount = achievements.filter((a: any) => a.isUnlocked).length;

  return (
    <GridBackground>
      <div className="container mx-auto px-4 pb-16 pt-28">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground font-mono-tech">Achievements</p>
          <h1 className="text-3xl font-orbitron font-bold tracking-tight">Consistency Index</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Earn badges for consistency, streaks, levels, and domain mastery. Silver is crisp white; platinum glows white.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="outline" className="font-mono-tech">Unlocked {unlockedCount}/{achievements.length || 0}</Badge>
          <Badge variant="secondary" className="font-mono-tech">Grades: Bronze / Silver / Gold / Platinum</Badge>
        </div>
      </div>

      <Separator className="my-6" />

      {(!isLoaded || isLoading || !domainsLoaded) && (
        <div className="py-12 text-center text-muted-foreground">Loading achievements...</div>
      )}

      {isLoaded && user && !isLoading && domainsLoaded && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {achievements.map((achievement) => {
          const grade = (achievement.grade ?? "bronze") as keyof typeof gradeVisual;
          const unlocked = Boolean(achievement.isUnlocked);
          const visual = gradeVisual[grade];

          return (
            <HoverCard key={achievement.id} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Card
                  variant="cyber"
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 bg-card p-5",
                    visual.border,
                    unlocked ? "shadow-[0_0_24px_rgba(34,197,94,0.2)]" : "opacity-85"
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-br",
                      visual.overlay
                    )}
                    aria-hidden
                  />
                  <div className="relative p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono-tech">
                          {achievement.type.replace(/_/g, " ")}
                        </p>
                        <h3 className="font-orbitron text-lg font-bold text-foreground">
                          {achievement.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={cn("text-xs font-bold", visual.badge)}>
                          {achievement.grade}
                        </Badge>
                        <Badge variant="secondary" className="font-mono-tech text-[11px]">
                          {difficultyCopy[achievement.difficulty]}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/90 font-rajdhani leading-snug min-h-[42px]">
                      {achievement.description}
                    </p>

                    <div className="flex items-center justify-between text-xs font-mono-tech text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {!unlocked && <Lock className="w-3 h-3" />}
                        {requirementLabel(achievement)}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full border",
                          unlocked ? "border-emerald-400 text-emerald-300" : "border-border"
                        )}
                      >
                        {unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                  </div>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 text-left">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Achievement</p>
                <p className="text-sm font-semibold text-foreground">{achievement.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                <p className="text-xs text-muted-foreground mt-2">Requirement: {requirementLabel(achievement)}</p>
              </HoverCardContent>
            </HoverCard>
          );
        })}
        </div>
      )}
      </div>
    </GridBackground>
  );
}
