"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { GridBackground } from "@/components/GridBackground";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier,
      });
      setStage("reset");
      setInfo("We sent a 6-digit code to your email. Enter it with your new password.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Could not start password reset.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push("/dashboard");
        return;
      }

      setError("Reset incomplete. Please try again.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Invalid code or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GridBackground>
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 bg-primary/5 mb-4">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono-tech text-primary uppercase tracking-wider">
                Credential Recovery
              </span>
            </div>
            <h1 className="font-orbitron font-bold text-3xl mb-2">
              Reset <span className="text-primary glow-text">Access</span>
            </h1>
            <p className="text-muted-foreground font-rajdhani">
              Request a reset code and set a new password.
            </p>
          </div>

          <Card className="p-6 border border-primary/30 bg-card/70 backdrop-blur animate-fade-in-up">
            {stage === "request" ? (
              <form className="space-y-4" onSubmit={handleRequest}>
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="font-rajdhani text-sm text-foreground">
                    Email or username
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

                {error && <p className="text-sm text-destructive font-rajdhani">{error}</p>}
                {info && <p className="text-sm text-primary font-rajdhani">{info}</p>}

                <Button type="submit" className="w-full" disabled={submitting || !isLoaded}>
                  {submitting ? "Sending code..." : "Send reset code"}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleReset}>
                <div className="space-y-2">
                  <Label htmlFor="code" className="font-rajdhani text-sm text-foreground">
                    Reset code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono-tech tracking-[0.3em] text-center"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-rajdhani text-sm text-foreground">
                    New password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono-tech"
                  />
                </div>

                {error && <p className="text-sm text-destructive font-rajdhani">{error}</p>}
                {info && <p className="text-sm text-primary font-rajdhani">{info}</p>}

                <Button type="submit" className="w-full" disabled={submitting || !isLoaded}>
                  {submitting ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            )}

            <p className="mt-4 text-center text-sm text-muted-foreground font-rajdhani">
              Remembered it? <Button variant="link" className="px-1 font-rajdhani" onClick={() => router.push("/auth/sign-in")}>Back to sign in</Button>
            </p>
          </Card>
        </div>
      </main>
    </GridBackground>
  );
}
