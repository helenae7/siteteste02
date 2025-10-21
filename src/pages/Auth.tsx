// src/pages/Auth.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Troque o caminho abaixo para a sua nova logo (ex.: gestor-ia.png)
import logo from "@/assets/gestor-ia.png";

const Auth = () => {
  // mude para "true" se quiser iniciar na aba de login
  const [isLogin, setIsLogin] = useState(false);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Se já estiver logado, vai direto para a Home
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/");
    };
    checkSession();
  }, [navigate]);

  // Aceita telefone ou e-mail. Se for telefone, cria um e-mail interno para o Auth.
  const normalizeEmail = (value: string) => {
    if (!value) return "";
    return value.includes("@")
      ? value.trim()
      : `${value.replace(/\D/g, "")}@iazapuser.com`;
  };

  // Garante que exista uma linha na TABELA DO SEU DB (usuarios)
  // e retorna o id numérico (que usamos para filtrar transações)
  const ensureUsuarioRow = async (email: string, phoneGuess?: string) => {
    const { data: found, error: findError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findError) throw findError;
    if (found?.id) return found.id;

    const insertPayload: Record<string, any> = {
      nome: username || "Usuário",
      email,
      telefone: phoneGuess || null,
      mensagens: 0,
      tem_plano: false,
      // senha NÃO é salva aqui – fica apenas no Auth
    };

    const { data: inserted, error: insertError } = await supabase
      .from("usuarios")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError) throw insertError;
    return inserted.id as number;
  };

  // Após logar: garante usuário na tabela e salva o id localmente
  const completeLogin = async (email: string, phoneGuess?: string) => {
    const usuarioId = await ensureUsuarioRow(email, phoneGuess);
    localStorage.setItem("usuario_id", String(usuarioId));
    toast({
      title: "Login realizado!",
      description: "Bem-vindo(a) 👋",
      // shadcn/ui geralmente só tem "default" e "destructive"
      // então deixamos "default" para sucesso (verde)
    });
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data?.session) {
          await completeLogin(email, phoneGuess);
        }
      } else {
        // ===== CRIAR CONTA =====
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        // Login imediato após criar (se o provider exigir confirmação, desative no painel)
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;

        // Garante a linha em `usuarios`
        await completeLogin(email, phoneGuess);

        // Toast “verde” de sucesso
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
          <CardTitle className="text-2xl">
            Agente <span className="text-primary">IA</span>
          </CardTitle>
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
              {loading ? (isLogin ? "Entrando..." : "Criando...") : isLogin ? "Entrar" : "Criar conta"}
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
