"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { DomainCard } from "@/components/DomainCard";
import { useDomains, useSelectDomains, useUserDomains } from "@/hooks/useDomains";

import {
  Brain,
  Dumbbell,
  Heart,
  Briefcase,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Lock,
  Check,
  Terminal,
  Moon,
  Users,
  Coins,
  Zap,
  Shield,
  Keyboard,
  Crown,
  Home,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";

const MAX_DOMAINS = 2;

const iconMap: Record<string, React.ComponentType<any>> = {
  Brain,
  Dumbbell,
  Heart,
  Briefcase,
  BookOpen,
  Sparkles,
  Terminal,
  Moon,
  Users,
  Coins,
  Zap,
  Shield,
  Keyboard,
  Crown,
  Home,
};

export default function Onboarding() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const { data: domains, isLoading: domainsLoading } = useDomains();
  const { data: userDomains } = useUserDomains();
  const selectDomainsMutation = useSelectDomains();

  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  // Only treat it as "locked" if the locked flag exists and we have 2 locked domains
  const lockedDomainIds = useMemo(() => {
    const locked = (userDomains ?? []).filter((d) => d.locked);
    return locked.map((d) => d.id);
  }, [userDomains]);

  const hasSelectedTwoDomains = lockedDomainIds.length === MAX_DOMAINS;

  // Sync selection state to locked domains when locked (so UI always shows correct ticked cards)
  useEffect(() => {
    if (hasSelectedTwoDomains) {
      setSelectedDomains(lockedDomainIds);
    }
  }, [hasSelectedTwoDomains, lockedDomainIds]);

  // Trigger user sync when they land here (your existing behavior)
  useEffect(() => {
    if (isLoaded && user) {
      fetch("/api/users");
    }
  }, [isLoaded, user]);

  const handleDomainClick = (domainId: string) => {
    // Hard stop in client if locked (prevents reselecting even if a card is clickable)
    if (hasSelectedTwoDomains) {
      toast({
        title: "Domains locked",
        description: "You already chose 2 domains. This path cannot be changed.",
        variant: "destructive",
      });
      return;
    }

    setSelectedDomains((prev) => {
      if (prev.includes(domainId)) return prev.filter((id) => id !== domainId);
      if (prev.length >= MAX_DOMAINS) return prev;
      return [...prev, domainId];
    });
  };

  const handleContinue = async () => {
    if (hasSelectedTwoDomains) {
      router.push("/dashboard");
      return;
    }

    // Enforce EXACTLY 2 (since your onboarding goal is 2 domains)
    if (selectedDomains.length !== MAX_DOMAINS) {
      toast({
        title: "Pick exactly 2 domains",
        description: `Select ${MAX_DOMAINS} domains to lock your path.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await selectDomainsMutation.mutateAsync(selectedDomains);

      toast({
        title: "Domains Selected!",
        description: `You've chosen ${selectedDomains.length} domains for your journey.`,
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save domain selection. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <>
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
           {!hasSelectedTwoDomains && (
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
    <span className="text-sm font-mono-tech text-primary uppercase tracking-wider">
      Step 1 of 3
    </span>
  </div>
)}
  

            <h1 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
              {hasSelectedTwoDomains ? (
                <>
                  Domains <span className="text-primary glow-text">Locked</span>
                </>
              ) : (
                <>
                  Choose Your <span className="text-primary glow-text">Domains</span>
                </>
              )}
            </h1>

            <p className="text-muted-foreground font-rajdhani text-lg max-w-xl mx-auto">
              {hasSelectedTwoDomains ? (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Can't Change Path - Domains are locked for consistency
                </span>
              ) : (
                <>
                  Select exactly{" "}
                  <span className="text-primary font-bold">{MAX_DOMAINS}</span> life domains to focus your growth journey.
                </>
              )}
            </p>
          </div>

          {/* Selection counter */}
          {!hasSelectedTwoDomains ? (
            <div
              className="flex items-center justify-center gap-4 mb-8 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <span className="text-sm font-mono-tech text-muted-foreground uppercase">Selected:</span>
                <span className="font-orbitron font-bold text-primary">{selectedDomains.length}</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-orbitron text-muted-foreground">{MAX_DOMAINS}</span>
              </div>

              {selectedDomains.length === MAX_DOMAINS && (
                <div className="flex items-center gap-1 text-sm text-primary">
                  <AlertCircle className="w-4 h-4" />
                  <span>Ready to lock</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-4 mb-8 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-primary/30">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono-tech text-primary uppercase">Path Locked:</span>
                <span className="font-orbitron font-bold text-primary">
                  {lockedDomainIds.length} Domains
                </span>
              </div>
            </div>
          )}

          {/* Domain Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {domainsLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading domains...</span>
              </div>
            ) : domains ? (
              domains.map((domain, index) => {
                const isSelected = hasSelectedTwoDomains
                  ? lockedDomainIds.includes(domain.id)
                  : selectedDomains.includes(domain.id);

                const showLockOverlay = hasSelectedTwoDomains && !isSelected;

                const IconComponent = iconMap[domain.icon as keyof typeof iconMap] || Sparkles;
                const icon = <IconComponent className="w-full h-full" />;

                return (
                  <div
                    key={domain.id}
                    className="animate-fade-in-up relative"
                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                  >
                    {/* Selected tick badge (only for the locked two) */}
                
                    {/* Small lock badge (state indicator, not a "page lock") */}
                    {hasSelectedTwoDomains && (
                      <div className="absolute -top-2 -left-2 z-20">
                        <div className="w-6 h-6 bg-card rounded-full flex items-center justify-center border border-primary/30">
                          <Lock className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    )}

                    <DomainCard
                      id={domain.id}
                      name={domain.name}
                      description={domain.description}
                      icon={icon}
                      selected={isSelected}
                      disabled={hasSelectedTwoDomains}
                      // IMPORTANT: don't even attach click handler when locked
                      onClick={
                        hasSelectedTwoDomains ? undefined : () => handleDomainClick(domain.id)
                      }
                    />

                    {/* Overlay only for unselected cards when locked (selected ones stay clear) */}
                    {showLockOverlay && (
                      <div className="absolute inset-0 z-10 bg-background/30 backdrop-blur-[1px] rounded-lg flex items-center justify-center pointer-events-none">
                        <Lock className="w-8 h-8 text-primary/60" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  Failed to load domains. Please refresh the page.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div
            className="flex items-center justify-between animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={hasSelectedTwoDomains ? () => router.push("/dashboard") : handleContinue}
              disabled={
                selectDomainsMutation.isPending ||
                (!hasSelectedTwoDomains && selectedDomains.length !== MAX_DOMAINS)
              }
              className="gap-2"
            >
              {hasSelectedTwoDomains
                ? "Go to Dashboard"
                : selectDomainsMutation.isPending
                ? "Saving..."
                : "Continue"}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
