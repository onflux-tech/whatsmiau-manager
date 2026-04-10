import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import pb from "@/lib/pocketbase";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/setup/status")
      .then((r) => r.json())
      .then((d) => setNeedsSetup(d.needsSetup))
      .catch(() => setNeedsSetup(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pb.collection("_superusers").authWithPassword(email, password);
      window.location.href = "/";
    } catch {
      toast.error("Credenciais inválidas");
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await pb.send("/api/setup", {
        method: "POST",
        body: { email, password, passwordConfirm: confirm },
      });
      await pb.collection("_superusers").authWithPassword(email, password);
      window.location.href = "/";
    } catch {
      toast.error("Erro ao criar conta");
      setLoading(false);
    }
  };

  if (needsSetup === null) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-dot-pattern relative flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">WhatsMiau</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {needsSetup ? "Crie sua conta de administrador" : "Manager"}
          </p>
        </div>

        <form
          onSubmit={needsSetup ? handleSetup : handleLogin}
          className="glass space-y-4 rounded-lg border p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={needsSetup ? 8 : undefined}
              required
            />
          </div>

          {needsSetup && (
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? needsSetup
                ? "Criando..."
                : "Entrando..."
              : needsSetup
                ? "Criar conta"
                : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
