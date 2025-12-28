import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface DomainCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function DomainCard({
  name,
  description,
  icon,
  selected,
  disabled,
  onClick,
}: DomainCardProps) {
  return (
    <Card
      variant="domain"
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative p-6 transition-all duration-300 group",
        selected && "border-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]",
        disabled && !selected && "opacity-40 cursor-not-allowed",
        !disabled && !selected && "hover:scale-[1.02]"
      )}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6  bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* Glow effect on hover/select */}
      <div
        className={cn(
          "absolute inset-0  opacity-0 transition-opacity duration-300",
          selected && "opacity-100",
          !disabled && "group-hover:opacity-50"
        )}
        style={{
          background: `radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className={cn(
            "w-16 h-16  flex items-center justify-center mb-4 transition-all duration-300 bg-primary/10 border-2 border-primary/30",
            selected ? "scale-110 border-primary/60" : "group-hover:scale-105"
          )}
          style={{
            boxShadow: selected ? `0 0 25px hsl(var(--primary) / 0.3)` : "none",
          }}
        >
          <div className="w-8 h-8 text-primary">
            {icon}
          </div>
        </div>

        {/* Text */}
        <h3 className="font-orbitron font-bold text-lg mb-2 text-foreground">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground font-rajdhani leading-relaxed">
          {description}
        </p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary/30 " />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary/30 " />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary/30 " />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary/30 " />
    </Card>
  );
}