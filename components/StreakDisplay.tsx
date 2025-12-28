import { Flame, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  todayCompleted,
  className,
}: StreakDisplayProps) {
  const isAtRisk = !todayCompleted && currentStreak > 0;

  return (
    <Card variant="cyber" className={cn("p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-orbitron font-bold text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Streak Status
        </h3>
        {isAtRisk && (
          <div className="flex items-center gap-1 text-destructive text-sm animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            At Risk
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="relative">
          <div
            className={cn(
              "p-4 border-2 transition-all duration-300",  // ✅ Fixed spacing
              isAtRisk
                ? "border-destructive/50 bg-destructive/10"
                : "border-primary/50 bg-primary/10"
            )}
          >
            <p className="text-xs font-mono-tech uppercase tracking-wider text-muted-foreground mb-1">
              Current
            </p>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-4xl font-orbitron font-bold",
                  isAtRisk ? "text-destructive" : "text-primary"
                )}
              >
                {currentStreak}
              </span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-4 border-2 border-secondary/30 bg-secondary/5">  {/* ✅ Fixed spacing */}
          <p className="text-xs font-mono-tech uppercase tracking-wider text-muted-foreground mb-1">
            Longest
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-orbitron font-bold text-secondary">
              {longestStreak}
            </span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
            <TrendingUp className="w-3 h-3" />
            <span>Personal Best</span>
          </div>
        </div>
      </div>

      {/* Streak Protection Status */}
      <div className="mt-4 p-3 bg-muted/50 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-rajdhani">Streak Shield</span>
          </div>
          <span className="text-xs font-mono-tech text-muted-foreground">
            {todayCompleted ? "Protected" : "Vulnerable"}
          </span>
        </div>
      </div>
    </Card>
  );
}
