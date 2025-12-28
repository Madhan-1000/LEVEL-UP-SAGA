import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getLevelInfo } from "@/lib/game-logic";

interface XPProgressProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

export function XPProgress({ currentXP, maxXP, level, className }: XPProgressProps) {
  const percentage = (currentXP / maxXP) * 100;
  const levelInfo = getLevelInfo(level);
  const title = (levelInfo?.title ?? "Unknown").toUpperCase();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14  border-2 border-primary/50 bg-card p-[2px] pulse-glow">
              <div className="w-full h-full  bg-background flex items-center justify-center">
                <span className="font-orbitron font-bold text-xl text-primary glow-text">
                  {level}
                </span>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary  flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">LV</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-mono-tech uppercase tracking-wider">Current Level</p>
            <p className="font-orbitron font-semibold text-foreground">
              {title}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground font-mono-tech uppercase tracking-wider">Experience</p>
          <p className="font-mono-tech text-lg">
            <span className="text-primary">{currentXP.toLocaleString()}</span>
            <span className="text-muted-foreground"> / {maxXP.toLocaleString()}</span>
          </p>
        </div>
      </div>
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-3"
        />
        <div 
          className="absolute top-0 h-full w-1 bg-foreground/50  transition-all duration-500"
          style={{ left: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs font-mono-tech text-muted-foreground">
        <span>+{Math.round(maxXP - currentXP)} XP to Level {level + 1}</span>
        <span>{Math.round(percentage)}% Complete</span>
      </div>
    </div>
  );
}