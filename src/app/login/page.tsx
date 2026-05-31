"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";
import { fetchApi } from "@/services/api";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        // Fluxo de Cadastro
        const data = await fetchApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        // Se cadastrou com sucesso, muda pro modo login e preenche a senha/email
        setIsRegistering(false);
        setError("Conta criada com sucesso! Faça login.");
      } else {
        // Fluxo de Login
        const data = await fetchApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        
        if (data.token) {
          localStorage.setItem("token", data.token);
          // O usuário "real" seria extraído do token ou /me, mas por enquanto:
          setUser({ id: "real", name: email.split("@")[0], email });
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/50 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 -z-10" />
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isRegistering ? "Criar Conta" : "Bem-vindo de volta"}
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? "Crie sua conta para começar a gerenciar formulários" 
              : "Insira suas credenciais para acessar o painel administrativo"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className={`text-sm text-center p-2 rounded ${error.includes("sucesso") ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                {error}
              </div>
            )}
            
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  required={isRegistering}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {!isRegistering && (
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Esqueceu a senha?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Aguarde..." : (isRegistering ? "Cadastrar" : "Entrar")}
            </Button>
            <button 
              type="button" 
              onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isRegistering ? "Já tem uma conta? Faça login" : "Não tem conta? Cadastre-se"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
