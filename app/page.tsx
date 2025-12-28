"use client";

import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/GridBackground";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Shield, 
  Flame, 
  ChevronRight,
  Brain,
  Dumbbell,
  Heart,
  Briefcase,
  BookOpen,
  Sparkles
} from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  {
    icon: Target,
    title: "Choose Your Path",
    description: "Select up to 2 life domains to focus your growth journey.",
  },
  {
    icon: Zap,
    title: "Earn XP",
    description: "Complete daily tasks to gain experience and level up.",
  },
  {
    icon: Flame,
    title: "Build Streaks",
    description: "Maintain consistency to unlock powerful streak bonuses.",
  },
  {
    icon: Shield,
    title: "Stay Accountable",
    description: "Anti-cheat systems ensure authentic progress.",
  },
];

const domains = [
  { icon: Brain, name: "Mind" },
  { icon: Dumbbell, name: "Body" },
  { icon: Heart, name: "Soul" },
  { icon: Briefcase, name: "Career" },
  { icon: BookOpen, name: "Skills" },
  { icon: Sparkles, name: "Creative" },
];

export default function Index() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <GridBackground>


        <section className="relative min-h-screen flex items-start justify-center pt-14">
        <div className="container mx-auto text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 border border-primary/30 bg-primary/5 mb-5 animate-fade-in scale-140">
            <div className="w-3 h-3 bg-primary animate-[pulse_1.25s_ease-in-out_infinite]" />
            <span className="text-base font-mono-tech text-primary uppercase tracking-wider font-bold">
              System Online
            </span>
          </div>

          {/* Main title */}
          <h1 className="font-orbitron font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="block text-foreground">LEVEL UP</span>
            <span className="block gradient-text">YOUR LIFE</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground font-rajdhani max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Transform your daily habits into an epic journey of self-improvement.
            Gain XP, level up, and become the hero of your own story.
          </p>


          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              { label: "Active Runners", value: "12.4K" },
              { label: "Tasks Completed", value: "1.2M" },
              { label: "XP Earned", value: "48M" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains Preview */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4">
              Choose Your <span className="text-primary glow-text">Domains</span>
            </h2>
            <p className="text-muted-foreground font-rajdhani text-lg max-w-xl mx-auto">
              Focus your energy on the areas that matter most to you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {domains.map((domain, index) => {
              const Icon = domain.icon;
              return (
                <div
                  key={domain.name}
                  className="group p-6 border border-border bg-card/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 text-center animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-primary/10 border border-primary/30">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-orbitron font-semibold text-sm">
                    {domain.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4">
              How It <span className="text-primary glow-text">Works</span>
            </h2>
            <p className="text-muted-foreground font-rajdhani text-lg">
              Your journey to self-improvement, gamified
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 border border-border bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-orbitron font-bold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-rajdhani text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4">
              Ready to <span className="gradient-text">Level Up</span>?
            </h2>
            <p className="text-muted-foreground font-rajdhani text-lg mb-8">
              Join thousands of players already on their journey to becoming the best version of themselves.
            </p>
            <Link href="/onboarding">
              <Button variant="default" size="xl">
                Start Your Journey
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground font-mono-tech">
            &copy; 2025 LEVEL-UP-SAGA. All systems operational.
          </p>
        </div>
      </footer>

      </GridBackground>
    );
  }

  return (
    <GridBackground>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="container mx-auto text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 border border-primary/30 bg-primary/5 mt-12 mb-8 animate-fade-in scale-140">
            <div className="w-3 h-3 bg-primary animate-[pulse_1.25s_ease-in-out_infinite]" />
            <span className="text-base font-mono-tech text-primary uppercase tracking-wider font-bold">
              System Online
            </span>
          </div>

          {/* Main title */}
          <h1 className="font-orbitron font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="block text-foreground">LEVEL UP</span>
            <span className="block gradient-text">YOUR LIFE</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground font-rajdhani max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Transform your daily habits into an epic journey of self-improvement.
            Gain XP, level up, and become the hero of your own story.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/auth/sign-up">
              <Button variant="default" size="xl" className="w-full sm:w-auto">
                Begin Your Saga
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Access Terminal
              </Button>
            </Link>
          </div>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              { label: "Active Runners", value: "12.4K" },
              { label: "Tasks Completed", value: "1.2M" },
              { label: "XP Earned", value: "48M" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains Preview */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4">
              Choose Your <span className="text-primary glow-text">Domains</span>
            </h2>
            <p className="text-muted-foreground font-rajdhani text-lg max-w-xl mx-auto">
              Focus your energy on the areas that matter most to you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {domains.map((domain, index) => {
              const Icon = domain.icon;
              return (
                <div
                  key={domain.name}
                  className="group p-6 border border-border bg-card/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 text-center animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-primary/10 border border-primary/30">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-orbitron font-semibold text-sm">
                    {domain.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4">
              How It <span className="text-primary glow-text">Works</span>
            </h2>
            <p className="text-muted-foreground font-rajdhani text-lg">
              Your journey to self-improvement, gamified
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 border border-border bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-orbitron font-bold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-rajdhani text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4">
              Ready to <span className="gradient-text">Level Up</span>?
            </h2>
            <p className="text-muted-foreground font-rajdhani text-lg mb-8">
              Join thousands of players already on their journey to becoming the best version of themselves.
            </p>
            <Link href="/onboarding">
              <Button variant="default" size="xl">
                Start Your Journey
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground font-mono-tech">
            &copy; 2025 LEVEL-UP-SAGA. All systems operational.
          </p>
        </div>
      </footer>
    </GridBackground>
  );
}
