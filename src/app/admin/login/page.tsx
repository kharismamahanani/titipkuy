"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Gagal login");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-sm rounded-2xl p-8"
      >
        <div className="text-center">
          <p className="gradient-text font-heading text-2xl font-extrabold">
            TitipKuy! 📦
          </p>
          <p className="mt-1 text-sm text-foreground/60">Admin Panel</p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full bg-gradient-to-r from-primary-from to-primary-to text-white"
        >
          {isLoading && <Loader2 className="animate-spin" size={16} />}
          Masuk
        </Button>
      </form>
    </div>
  );
}
