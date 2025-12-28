"use client";

import Link from "next/link";
import { GridBackground } from "@/components/GridBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, HelpCircle, Target, Clock3, Activity, Shield, BookOpen } from "lucide-react";
import { Trophy } from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    icon: HelpCircle,
    points: [
      "Create an account or sign in with Clerk.",
      "Pick exactly two domains in Onboarding to unlock task assignment.",
      "Head to Dashboard to receive today's tasks automatically or tap 'Assign today's tasks'.",
    ],
  },
  {
    title: "Tasks & XP",
    icon: Target,
    points: [
      "Each task grants XP and advances your level using the config/levels.json ladder.",
      "Deadlines and streak-type tasks respect their configured limits; missed tasks can fail after the day.",
      "Complete tasks to log experiences and unlock achievements when criteria are met.",
    ],
  },
  {
    title: "Timeline / Activity",
    icon: Activity,
    points: [
      "Today's activity: add entries on /timeline (redirects to today's day).",
      "Past days: view-only to keep history locked; delete is available on entries you own.",
      "Completed tasks auto-log to the activity timeline with their timestamp.",
    ],
  },
  {
    title: "Progress & Streaks",
    icon: Clock3,
    points: [
      "XP bar shows current level title straight from the level config.",
      "Streaks update when you complete tasks and log daily focus hours.",
      "Achievements trigger via the engine when XP, domains, or streak rules are satisfied.",
    ],
  },
  {
    title: "Safety & Fair Play",
    icon: Shield,
    points: [
      "Anti-cheat flags suspiciously fast completions; cheated tasks award no XP.",
      "Domain locking prevents mid-day path swaps; pick carefully during onboarding.",
      "Activity editing is limited to today to avoid rewriting history.",
    ],
  },
  {
    title: "Need More?",
    icon: BookOpen,
    points: [
      "Visit Dashboard for live stats and assignments.",
      "Check /timeline/days to review past activity buckets.",
      "Reach out to support with the task ID or timeline entry ID when reporting issues.",
    ],
  },
  {
    title: "Achievements",
    icon: Trophy,
    points: [
      "Earn badges for streaks, levels, and your selected domains only.",
      "View them at /achievements; locked items stay hidden until you qualify.",
      "Badges are grade-colored (bronze, silver, gold, platinum) with subtle glow cues.",
    ],
  },
];

export default function HelpPage() {
  return (
    <GridBackground>
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono-tech text-primary uppercase tracking-wider">Help Center</span>
            </div>
            <h1 className="font-orbitron text-3xl md:text-4xl font-bold">How to use Level-Up Saga</h1>
            <p className="text-muted-foreground font-rajdhani text-lg">Quick guidance for tasks, activity, levels, and streaks.</p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button variant="default">Go to Dashboard</Button>
              </Link>
              <Link href="/timeline">
                <Button variant="outline">Open Activity</Button>
              </Link>
              <Link href="/achievements">
                <Button variant="ghost">View Achievements</Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} variant="cyber" className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-orbitron font-bold text-lg">{section.title}</h2>
                  </div>
                  <Separator className="bg-border" />
                  <ul className="space-y-2 text-sm text-muted-foreground font-rajdhani leading-relaxed">
                    {section.points.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary mt-[2px]" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </GridBackground>
  );
}
