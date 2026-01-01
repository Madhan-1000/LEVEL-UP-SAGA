import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Zap, Flame, Clock } from "lucide-react";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  domain: string;
  domainColor?: string;
  streak?: number;
  deadline?: string;
  onComplete: (task: { id: string; title: string }) => void;
}

export function TaskCard({
  id,
  title,
  description,
  xp,
  completed,
  domain,
  streak = 0,
  deadline,
  onComplete,
}: TaskCardProps) {
  return (
    <Card
      variant="cyber"
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        !completed && "hover:scale-[1.01] hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
      )}
    >
      {/* Domain color accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

      <div className="p-5 pl-6">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-1">

            <Checkbox
              id={id}
              checked={completed}
              onCheckedChange={(checked) => {
                if (checked && !completed) onComplete({ id, title })
              }}
            />

          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono-tech uppercase tracking-wider px-2 py-0.5 bg-primary/20 text-primary">
                {domain}
              </span>
              {streak > 0 && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Flame className="w-3 h-3" />
                  {streak}
                </span>
              )}
            </div>

            <h4
              className={cn(
                "font-orbitron font-semibold text-lg mb-1 transition-all duration-300",
                completed && "line-through text-muted-foreground"
              )}
            >
              {title}
            </h4>
            <p
              className={cn(
                "text-base text-muted-foreground font-rajdhani",
                completed && "line-through"
              )}
            >
              {description}
            </p>

            {deadline && !completed && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{deadline}</span>
              </div>
            )}
          </div>

          {/* XP Reward */}
          <div className="flex flex-col items-end">
            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 font-mono-tech font-bold transition-all duration-300",  // ✅ Fixed spacing
                completed
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/20 text-secondary"
              )}
            >
              <Zap className="w-4 h-4" />
              <span>+{xp}</span>
            </div>
            {completed && (
              <span className="text-xs text-primary mt-1 font-mono-tech">
                EARNED
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
