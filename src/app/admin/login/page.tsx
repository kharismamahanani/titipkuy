"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";

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
    <div className="flex min-h-screen items-center justify-center bg-tk-cream px-4">
      <TkCard className="w-full max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <div className="text-center">
            <p className="text-2xl font-extrabold">
              <span className="text-tk-charcoal">Titip</span>
              <span className="text-tk-orange">Kuy!</span> 📦
            </p>
            <p className="mt-1 text-sm text-tk-muted">Admin Panel</p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="username" className={tkLabelClass}>
                Username
              </Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={tkInputClass}
              />
            </div>

            <div>
              <Label htmlFor="password" className={tkLabelClass}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={tkInputClass}
              />
            </div>
          </div>

          <TkButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="mt-6 w-full justify-center"
          >
            {isLoading && <Loader2 className="mr-2 animate-spin" size={16} />}
            Masuk
          </TkButton>
        </form>
      </TkCard>
    </div>
  );
}
