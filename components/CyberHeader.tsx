"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, LayoutDashboard, Target, LogIn, Activity, Info, Trophy, Menu, X, Route } from "lucide-react";
import { AccountMenu } from "@/components/AccountMenu";

export function CyberHeader() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/onboarding", label: "Domains", icon: Target },
    { href: "/timeline", label: "Activity", icon: Activity },
    { href: "/journey", label: "Journey", icon: Route },
    { href: "/achievements", label: "Achievements", icon: Trophy },
    { href: "/help", label: "Help", icon: Info }
  ];

  const visibleNavItems = user ? navItems : navItems.filter((item) => item.href === "/help");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-primary/50 bg-card p-[2px] group-hover:border-primary transition-all duration-300">
              <div className="w-full h-full bg-background flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-orbitron font-bold text-lg tracking-wider text-foreground">
              LEVEL-UP-SAGA
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Navigation */}
          {isLoaded && visibleNavItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;  
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>  
                    <Button
                      variant="ghost"
                      className={cn(
                        "font-rajdhani",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Mobile menu toggle */}
          {isLoaded && visibleNavItems.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}

          {/* Auth Button / Account Menu */}
          {isLoaded && user ? (
            <AccountMenu />
          ) : (
            <Link href="/auth/sign-in">
              <Button variant="outline" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Enter System</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isLoaded && visibleNavItems.length > 0 && mobileOpen && (
        <div className="md:hidden border-b border-primary/20 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 font-rajdhani",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
