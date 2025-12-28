"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { GridBackground } from "@/components/GridBackground";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const result = await signUp.create({
        username,
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setInfo("We sent a 6-digit code to your email. Enter it below to verify.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Sign up failed. Check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const verification = await signUp.attemptEmailAddressVerification({ code: verificationCode });

      if (verification.status === "complete") {
        await setActive({ session: verification.createdSessionId });
        router.push("/onboarding");
        return;
      }

      setError("Verification incomplete. Please retry.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Invalid code. Please try again.");
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
              <UserPlus className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono-tech text-primary uppercase tracking-wider">
                Neural Registration
              </span>
            </div>
            <h1 className="font-orbitron font-bold text-3xl mb-2">
              Join the <span className="text-primary glow-text">System</span>
            </h1>
            <p className="text-muted-foreground font-rajdhani">Create your digital identity in the network</p>
          </div>

          <Card className="p-6 border border-primary/30 bg-card/70 backdrop-blur animate-fade-in-up">
            {!pendingVerification ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-rajdhani text-sm text-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="font-mono-tech"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-rajdhani text-sm text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono-tech"
                  />
                </div>

                {error && <p className="text-sm text-destructive font-rajdhani">{error}</p>}
                {info && <p className="text-sm text-primary font-rajdhani">{info}</p>}

                <Button type="submit" className="w-full" disabled={submitting || !isLoaded}>
                  {submitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerify}>
                <div className="space-y-2">
                  <Label htmlFor="code" className="font-rajdhani text-sm text-foreground">
                    Enter the 6-digit code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="font-mono-tech tracking-[0.3em] text-center"
                  />
                </div>

                {error && <p className="text-sm text-destructive font-rajdhani">{error}</p>}
                {info && <p className="text-sm text-primary font-rajdhani">{info}</p>}

                <Button type="submit" className="w-full" disabled={submitting || !isLoaded}>
                  {submitting ? "Verifying..." : "Verify and continue"}
                </Button>
              </form>
            )}

            <p className="mt-4 text-center text-sm text-muted-foreground font-rajdhani">
              Already have an account?{" "}
              <Button variant="link" className="px-1 font-rajdhani" onClick={() => router.push("/auth/sign-in")}>Sign in</Button>
            </p>
          </Card>
        </div>
      </main>
    </GridBackground>
  );
}
