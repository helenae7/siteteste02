// src/pages/Auth.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// sua imagem já está no projeto:
import logo from "@/assets/gestor-ia.png";

const Auth: React.FC = () => {
  // true = começar em Entrar | false = começar em Criar conta
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const [emailOrPhone, setEmailOrPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/");
    };
    checkSession();
  }, [navigate]);

  const normalizeEmail = (value: string) => {
    if (!value) return "";
    return value.includes("@")
      ? value.trim()
      : `${value.replace(/\D/g, "")}@iazapuser.com`;
  };

  // UPSERT em `usuarios` (garante que exista linha com id numérico)
  const ensureUsuarioRow = async (email: string, phoneGuess?: string) => {
    const payload: Record<string, any> = {
      nome: username || "Novo usuário",
      email,
      telefone: phoneGuess || null,
    };

    const { data, error } = await supabase
      .from("usuarios")
      .upsert(payload, { onConflict: "email" })
      .select("id")
      .single();

    if (error) throw error;
    return data.id as number;
  };

  const completeLogin = async (email: string, phoneGuess?: string) => {
    const usuarioId = await ensureUsuarioRow(email, phoneGuess);
    localStorage.setItem("usuario_id", String(usuarioId));
    toast({ title: "Login realizado!", description: "Bem-vindo(a) 👋" });
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = normalizeEmail(emailOrPhone);
    const phoneGuess = emailOrPhone.includes("@") ? "" : emailOrPhone;

    if (!email || !password) {
      toast({
        title: "Preencha todos os campos",
        description: "E-mail/telefone e senha são obrigatórios.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // ===== ENTRAR =====
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.session) await completeLogin(email, phoneGuess);
      } else {
        // ===== CRIAR CONTA =====
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        // login imediato após cadastro (desative "Confirm email before sign in" no painel para funcionar direto)
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;

        await completeLogin(email, phoneGuess);

        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Você já está logado(a).",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: isLogin ? "Falha ao logar" : "Falha ao criar conta",
        description: err?.message || "Verifique as credenciais ou tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 items-center">
          <img src={logo} alt="GESTOR IA" className="h-10 w-auto" />
          <CardTitle className="text-2xl">Agente <span className="text-primary">IA</span></CardTitle>
          <CardDescription>Use seu telefone ou e-mail cadastrado</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Nome</Label>
                <Input
                  id="username"
                  placeholder="Seu nome"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail ou telefone</Label>
              <Input
                id="email"
                placeholder="email@exemplo.com ou 3899..."
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isLogin ? "Entrando..." : "Criando...") : (isLogin ? "Entrar" : "Criar conta")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin((v) => !v)}
            >
              {isLogin ? "Não tem uma conta? Criar conta" : "Já tem uma conta? Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
