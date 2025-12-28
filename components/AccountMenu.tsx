"use client";

import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { Loader2, LogOut, Settings, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface AccountData {
  username: string;
  email: string;
}

export function AccountMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState<AccountData>({
    username: "",
    email: "",
  });

  useEffect(() => {
    if (!isLoaded || !user) return;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetch("/api/account");
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Failed to load account");
        setAccount({
          username: data.username || "",
          email: data.email || "",
        });
      } catch (err: any) {
        toast({ title: "Could not load account", description: err?.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: account.username,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Update failed");
      toast({ title: "Account updated", description: "Your changes are saved." });
      setSettingsOpen(false);
    } catch (err: any) {
      toast({
        title: "Could not update",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !user) return null;

  const avatar = user.imageUrl;
  const displayName = account.username || user.username || user.firstName || "Player";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                  {(displayName || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <span className="hidden sm:inline font-orbitron text-sm">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="font-orbitron text-sm">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate">{account.email || user.emailAddresses?.[0]?.emailAddress}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)} className="gap-2">
            <Settings className="w-4 h-4" />
            Account settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => signOut()}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur border border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-orbitron">Account settings</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your username and profile details. Email changes are locked during early access.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={account.username}
                  onChange={(e) => setAccount((prev) => ({ ...prev, username: e.target.value }))}
                  maxLength={32}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Locked in early access
                  </span>
                </Label>
                <Input id="email" value={account.email} disabled readOnly />
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSettingsOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
