"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { GridBackground } from "@/components/GridBackground";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await signIn.create({ identifier, password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
        return;
      }

      setError("Additional steps required. Please complete verification.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Sign in failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GridBackground>
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 bg-primary/5 mb-4">
              <LogIn className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono-tech text-primary uppercase tracking-wider">
                System Access
              </span>
            </div>
            <h1 className="font-orbitron font-bold text-3xl mb-2">
              Access <span className="text-primary glow-text">Terminal</span>
            </h1>
            <p className="text-muted-foreground font-rajdhani">Enter your credentials to access the system</p>
          </div>

          <Card className="p-6 border border-primary/30 bg-card/70 backdrop-blur animate-fade-in-up">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="identifier" className="font-rajdhani text-sm text-foreground">
                  Username or Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="font-mono-tech"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-rajdhani text-sm text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono-tech"
                />
              </div>

              {error && <p className="text-sm text-destructive font-rajdhani">{error}</p>}

              <Button type="submit" className="w-full" disabled={submitting || !isLoaded}>
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground font-rajdhani">
              <Button variant="link" className="px-1 font-rajdhani" onClick={() => router.push("/auth/forgot-password")}>Forgot password?</Button>
              <span className="mx-1">·</span>
              No account?{" "}
              <Button variant="link" className="px-1 font-rajdhani" onClick={() => router.push("/auth/sign-up")}>Sign up</Button>
            </p>
          </Card>
        </div>
      </main>
    </GridBackground>
  );
}
