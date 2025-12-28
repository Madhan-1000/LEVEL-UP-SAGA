"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { XPProgress } from "@/components/XPProgress";
import { TaskCard } from "@/components/TaskCard";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useTasks, useAssignTasks, useCompleteTask } from "@/hooks/useTasks";
import { useProfile } from "@/hooks/useProfile";
import { useUserDomains } from "@/hooks/useDomains";
import { useAchievements } from "@/hooks/useAchievements";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CalendarDays, ListTodo, Trophy, Target, Zap, Loader2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const achievementBadgeStyles: Record<string, string> = {
  bronze: "border-amber-500/60 bg-amber-900/40 text-amber-200",
  silver: "border-slate-200 bg-slate-100 text-slate-900",
  gold: "border-amber-300 bg-amber-200 text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]",
  platinum: "border-white bg-white text-slate-900 shadow-[0_0_14px_rgba(255,255,255,0.55)]",
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [focusSummary, setFocusSummary] = useState({
    totalHoursFocused: 0,
    hasLoggedToday: false,
    todayHoursFocused: null as number | null,
  });
  const [focusSummaryLoading, setFocusSummaryLoading] = useState(true);
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [focusHoursInput, setFocusHoursInput] = useState("0");
  const [isSavingFocusHours, setIsSavingFocusHours] = useState(false);

  const [experienceModal, setExperienceModal] = useState({
    open: false,
    taskId: "",
    taskTitle: "",
  });
  const [experienceText, setExperienceText] = useState("");
  const [experienceSubmitting, setExperienceSubmitting] = useState(false);
  const [experienceRecorded, setExperienceRecorded] = useState<Set<string>>(new Set());

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userDomains, isLoading: userDomainsLoading } = useUserDomains();
  const { data: achievementsData } = useAchievements();

  // Task management
  const { data: pendingTasks, isLoading: tasksLoading } = useTasks("pending");
  const { data: activeTasks } = useTasks("active");
  const { data: completedTasks } = useTasks("completed");

  const assignTasksMutation = useAssignTasks();
  const completeTaskMutation = useCompleteTask();

  // Prevent auto-assign from firing twice (StrictMode / re-renders)
  const autoAssignRanRef = useRef(false);

  const lockedDomainIds = useMemo(() => {
    return (userDomains ?? []).filter((d: any) => d.locked).map((d: any) => d.id);
  }, [userDomains]);

  const hasTwoLockedDomains = lockedDomainIds.length === 2;

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (tasksLoading || assignTasksMutation.isPending || !hasTwoLockedDomains) return;

    const hasTasks =
      (pendingTasks?.length ?? 0) + (activeTasks?.length ?? 0) + (completedTasks?.length ?? 0) > 0;

    if (hasTasks || autoAssignRanRef.current) return;

    autoAssignRanRef.current = true;

    assignTasksMutation
      .mutateAsync()
      .then(() => {
        toast({ title: "Tasks ready", description: "Assigned today's tasks." });
      })
      .catch((err: any) => {
        autoAssignRanRef.current = false; // allow retry if we failed
        toast({
          title: "Could not assign tasks",
          description: err?.message || "Please try again or re-lock your domains.",
          variant: "destructive",
        });
      });
  }, [
    isLoaded,
    user,
    tasksLoading,
    hasTwoLockedDomains,
    pendingTasks,
    activeTasks,
    completedTasks,
    assignTasksMutation,
    assignTasksMutation.isPending,
  ]);

  // Combine and dedupe all tasks for display (avoid duplicate keys across lists)
  const allTasks = useMemo(() => {
    const byId = new Map<string, any>();
    for (const t of pendingTasks || []) byId.set(t.id, t);
    for (const t of activeTasks || []) byId.set(t.id, t);
    for (const t of completedTasks || []) byId.set(t.id, t);
    return Array.from(byId.values());
  }, [pendingTasks, activeTasks, completedTasks]);

  // Calculate stats
  const completedCount = allTasks.filter((t: any) => t.status === "completed").length;
  const totalTasksCount = allTasks.length;
  const completionRate =
    totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  const completedToday = useMemo(() => {
    if (!allTasks.length) return false;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return allTasks.some((t: any) => {
      if (t.status !== "completed" || !t.completedAt) return false;

      const completedDate = new Date(t.completedAt);
      completedDate.setHours(0, 0, 0, 0);

      return completedDate.getTime() === startOfToday.getTime();
    });
  }, [allTasks]);

  // Load focus summary (total and today's hours) from the database
  useEffect(() => {
    if (!isLoaded || !user) return;

    let cancelled = false;

    const loadFocusSummary = async () => {
      try {
        const resp = await fetch("/api/focus");
        if (!resp.ok) throw new Error("Failed to load focus summary");
        const data = await resp.json();

        if (cancelled) return;

        const totalHours = Number(data.totalHoursFocused);
        const todayHours = Number(data.todayHoursFocused);

        setFocusSummary({
          totalHoursFocused: Number.isFinite(totalHours) ? totalHours : 0,
          hasLoggedToday: Boolean(data.hasLoggedToday),
          todayHoursFocused: Number.isFinite(todayHours) ? todayHours : null,
        });
      } catch (err) {
        console.error("Failed to load focus summary", err);
      } finally {
        if (!cancelled) setFocusSummaryLoading(false);
      }
    };

    loadFocusSummary();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user]);

  const openExperienceModal = (taskId: string, taskTitle: string) => {
    if (!taskId || experienceRecorded.has(taskId)) return;
    setExperienceText("");
    setExperienceModal({ open: true, taskId, taskTitle: taskTitle || "Task" });
  };

  const handleSubmitExperience = async (skipped = false) => {
    if (!experienceModal.taskId) return;

    try {
      setExperienceSubmitting(true);
      const resp = await fetch("/api/task-experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: experienceModal.taskId,
          content: skipped ? "" : experienceText,
          skipped,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || "Failed to save experience");

      setExperienceRecorded((prev) => {
        const next = new Set(prev);
        next.add(experienceModal.taskId);
        return next;
      });

      setExperienceModal({ open: false, taskId: "", taskTitle: "" });
      setExperienceText("");

      if (!skipped) {
        toast({ title: "Saved", description: "Experience logged." });
      }
    } catch (err: any) {
      toast({ title: "Could not save", description: err.message, variant: "destructive" });
    } finally {
      setExperienceSubmitting(false);
    }
  };

  const handleSaveFocusHours = async () => {
    const hours = Number(focusHoursInput);
    if (!Number.isFinite(hours) || hours < 0 || hours > 12) {
      toast({ title: "Invalid hours", description: "Enter a number between 0 and 12." });
      return;
    }

    try {
      setIsSavingFocusHours(true);
      const resp = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || "Failed to save focus hours");

      const apiTotal = Number(data.totalHoursFocused);
      setFocusSummary({
        totalHoursFocused: Number.isFinite(apiTotal) ? apiTotal : hours,
        hasLoggedToday: true,
        todayHoursFocused: hours,
      });

      toast({ title: "Focus logged", description: `${hours} hours recorded.` });
      setFocusModalOpen(false);
    } catch (err: any) {
      toast({ title: "Could not log focus", description: err.message, variant: "destructive" });
    } finally {
      setIsSavingFocusHours(false);
    }
  };

  const handleSkipFocusHours = () => {
    setFocusModalOpen(false);
    setFocusSummary((prev) => ({ ...prev, hasLoggedToday: true }));
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const result = await completeTaskMutation.mutateAsync({ taskId });

      if (result.cheatDetected) {
        toast({
          title: "⚠️ Task Failed",
          description: "Suspicious activity detected. Task marked as failed.",
          variant: "destructive",
        });
      } else {
        toast({
          title: `🎉 +${result.xpAwarded} XP Earned!`,
          description: `Task completed successfully!`,
        });

        if (result.levelUp) {
          toast({
            title: "🎮 LEVEL UP!",
            description: `You've reached Level ${result.levelUp.newLevel}!`,
          });
        }

        if (result.newAchievements.length > 0) {
          result.newAchievements.forEach((achievement: any) => {
            toast({
              title: "🏆 Achievement Unlocked!",
              description: `${achievement.name}: ${achievement.description}`,
            });
          });
        }

        const taskDetails = allTasks.find((t: any) => t.id === taskId);
        openExperienceModal(taskId, taskDetails?.template?.name ?? "Task");

        const newCompleted = completedCount + 1;
        if (newCompleted >= totalTasksCount && totalTasksCount > 0 && !focusSummary.hasLoggedToday) {
          setFocusModalOpen(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignTasks = async () => {
    if (!hasTwoLockedDomains) {
      toast({
        title: "Lock 2 domains first",
        description: "Pick your two focus domains to unlock task assignment.",
        variant: "destructive",
      });
      return;
    }

    try {
      autoAssignRanRef.current = true;
      await assignTasksMutation.mutateAsync();
      toast({ title: "Tasks ready", description: "Assigned today's tasks." });
    } catch (err: any) {
      autoAssignRanRef.current = false;
      toast({
        title: "Could not assign tasks",
        description: err?.message || "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  // Auth guard
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/auth/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="bg-background min-h-screen">
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-orbitron font-bold text-2xl md:text-3xl mb-2">
              Welcome back,{" "}
              <span className="text-primary glow-text">
                {profileLoading ? "Loading..." : profile?.username || "Player"}
              </span>
            </h1>
            <p className="text-muted-foreground font-rajdhani">
              Your daily quest awaits. Complete tasks to earn XP and level up.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* XP Progress */}
            <Card variant="cyber" className="p-5 md:col-span-2 animate-fade-in">
              {profile ? (
                <XPProgress
                  currentXP={profile.progress?.currentXp || 0}
                  maxXP={profile.levelInfo?.xpToNext || 2000}
                  level={profile.progress?.currentLevel || 1}
                />
              ) : (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </Card>

            {/* Daily Progress */}
            <Card variant="cyber" className="p-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-mono-tech text-muted-foreground uppercase">
                    Today's Progress
                  </p>
                  <p className="font-orbitron font-bold text-xl">
                    {completedCount}/{totalTasksCount}
                  </p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground font-mono-tech mt-2">
                {completionRate === 100 ? "All tasks complete! 🎉" : `${completionRate}% complete`}
              </p>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tasks Section */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="daily" className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="bg-card border border-border">
                    <TabsTrigger value="daily" className="gap-2 font-orbitron text-sm">
                      <CalendarDays className="w-4 h-4" />
                      Daily
                    </TabsTrigger>
                    <TabsTrigger value="all" className="gap-2 font-orbitron text-sm">
                      <ListTodo className="w-4 h-4" />
                      All
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="daily" className="space-y-4 mt-0">
                  {tasksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading tasks...</span>
                    </div>
                  ) : allTasks.length > 0 ? (
                    allTasks.map((task: any, index: number) => (
                      <div
                        key={task.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                      >
                        <TaskCard
                          id={task.id}
                          title={task.template.name}
                          description={task.template.description}
                          xp={task.template.xpReward}
                          completed={task.status === "completed"}
                          domain={task.template.domain.name}
                          domainColor={task.template.domain.color}
                          streak={profile?.currentStreak ?? profile?.progress?.currentStreak ?? 0}
                          deadline={task.deadlineAt}
                          onComplete={handleTaskComplete}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No tasks available.</p>
                      <Button
                        variant="default"
                        onClick={handleAssignTasks}
                        disabled={assignTasksMutation.isPending}
                        className="font-orbitron"
                      >
                        {assignTasksMutation.isPending ? "Assigning..." : "Assign today's tasks"}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4 mt-0">
                  {tasksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading tasks...</span>
                    </div>
                  ) : allTasks.length > 0 ? (
                    allTasks.map((task: any, index: number) => (
                      <div
                        key={task.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                      >
                        <TaskCard
                          id={task.id}
                          title={task.template.name}
                          description={task.template.description}
                          xp={task.template.xpReward}
                          completed={task.status === "completed"}
                          domain={task.template.domain.name}
                          domainColor={task.template.domain.color}
                          streak={profile?.currentStreak ?? profile?.progress?.currentStreak ?? 0}
                          deadline={task.deadlineAt}
                          onComplete={handleTaskComplete}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No tasks available.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Streak Display */}
              <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                {profile ? (
                  <StreakDisplay
                    currentStreak={profile.progress?.currentStreak || 0}
                    longestStreak={profile.progress?.longestStreak || 0}
                    todayCompleted={completedToday}
                  />
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Achievements Preview */}
              <Card variant="cyber" className="p-5 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <h3 className="font-orbitron font-bold">Achievements</h3>
                </div>

                {achievementsData ? (
                  <>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {achievementsData.achievements.slice(0, 8).map((achievement: any) => {
                        const gradeClass = achievementBadgeStyles[achievement.grade ?? "bronze"];
                        const isUnlocked = achievement.isUnlocked;

                        return (
                          <HoverCard key={achievement.id}>
                            <HoverCardTrigger asChild>
                              <div
                                className={cn(
                                  "aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-mono-tech",
                                  isUnlocked ? gradeClass : "border-border bg-muted/20 opacity-40"
                                )}
                                title={`${achievement.name}: ${achievement.description}`}
                              >
                                <Trophy
                                  className={cn(
                                    "w-5 h-5",
                                    isUnlocked ? "opacity-90" : "text-muted-foreground"
                                  )}
                                />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64 text-left">
                              <p className="text-xs uppercase tracking-widest text-muted-foreground">Achievement</p>
                              <p className="text-sm font-semibold text-foreground">{achievement.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                            </HoverCardContent>
                          </HoverCard>
                        );
                      })}
                    </div>
                    <div className="text-center text-xs text-muted-foreground mb-3">
                      {achievementsData.stats.unlocked} / {achievementsData.stats.total} unlocked
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg border-2 border-border bg-muted/20 opacity-40 flex items-center justify-center"
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    ))}
                  </div>
                )}

                <Link href="/achievements" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full font-orbitron">
                    View All Achievements
                  </Button>
                </Link>
              </Card>

              {/* Quick Stats */}
              <Card variant="cyber" className="p-5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <h3 className="font-orbitron font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Total Progress
                </h3>

                <div className="space-y-3">
                  {[
                    { label: "Tasks Completed", value: completedCount.toString() },
                    { label: "XP Earned", value: (profile?.progress?.totalXpEarned ?? 0).toString() },
                    {
                      label: "Hours Focused",
                      value: focusSummaryLoading
                          ? "..."
                        : focusSummary.totalHoursFocused.toFixed(1),
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm text-muted-foreground font-rajdhani">{stat.label}</span>
                      <span className="font-mono-tech font-bold text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Task Experience Modal */}
      <Dialog open={experienceModal.open} onOpenChange={(open) => open === false && setExperienceModal({ open: false, taskId: "", taskTitle: "" })}>
        <DialogContent className="sm:max-w-xl bg-card/95 backdrop-blur border border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl">How did this task feel?</DialogTitle>
            <DialogDescription className="text-muted-foreground font-rajdhani">
              {experienceModal.taskTitle || "Task"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label htmlFor="experience" className="text-sm text-foreground font-rajdhani">
              Share a quick note (optional)
            </Label>
            <Textarea
              id="experience"
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              placeholder="What was challenging? What went well?"
              className="min-h-[140px] font-rajdhani"
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleSubmitExperience(true)}
              disabled={experienceSubmitting}
            >
              Skip
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmitExperience(false)}
              disabled={experienceSubmitting}
            >
              {experienceSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Focus Hours Modal */}
      <Dialog open={focusModalOpen} onOpenChange={setFocusModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur border border-secondary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl">Log today&apos;s focus</DialogTitle>
            <DialogDescription className="text-muted-foreground font-rajdhani">
              Tell us how many hours you truly focused today (0-12). You can skip if you prefer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label htmlFor="focusHours" className="text-sm text-foreground font-rajdhani">
              Hours focused
            </Label>
            <Input
              id="focusHours"
              type="number"
              min={0}
              max={12}
              step={0.25}
              value={focusHoursInput}
              onChange={(e) => setFocusHoursInput(e.target.value)}
              className="font-mono-tech"
            />
            <p className="text-xs text-muted-foreground font-rajdhani">
              Be honest - this fuels your streak insights and XP pacing.
            </p>
          </div>

          <DialogFooter className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleSkipFocusHours} disabled={isSavingFocusHours}>
              Skip for today
            </Button>
            <Button type="button" onClick={handleSaveFocusHours} disabled={isSavingFocusHours}>
              {isSavingFocusHours ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
