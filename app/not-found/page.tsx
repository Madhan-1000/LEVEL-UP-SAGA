"use client";

import Link from 'next/link';  // ✅ Next.js Link
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center px-4 pt-24">  {/* ✅ pt-24 for header */}
        <div className="text-center">
          {/* 404 display */}
          <div className="relative mb-8">
            <h1 className="font-orbitron font-black text-8xl md:text-9xl text-primary glow-text">
              404
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="font-orbitron font-bold text-xl text-destructive">
              SYSTEM ERROR
            </h2>
          </div>

          <p className="text-muted-foreground font-rajdhani text-lg mb-8 max-w-md mx-auto">
            The requested sector does not exist in the network.
            This node may have been decommissioned or relocated.
          </p>

          <Link href="/">  // ✅ Fixed: href instead of to
            <Button variant="default" size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              Return to Main Hub
            </Button>
          </Link>

          {/* Decorative elements */}
          <div className="mt-16 font-mono-tech text-xs text-muted-foreground/50">
            <p>ERROR_CODE: 0x404_NOT_FOUND</p>
            <p>TIMESTAMP: {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
