import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
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
    const hasAt = value.includes("@");
    return hasAt ? value.trim() : `${value.replace(/\D/g,"")}@iazapuser.com`;
  };

  const ensureUsuarioRow = async (email: string, phoneGuess?: string) => {
    // procura pelo email na tabela usuarios; se não existir, cria
    const { data: found } = await supabase.from("usuarios").select("id").eq("email", email).maybeSingle();
    if (found?.id) return found.id;

    const insertPayload: any = { 
      nome: username || "Usuário",
      email, 
      telefone: phoneGuess || null, 
      mensagens: 0, 
      tem_plano: false, 
      senha: password 
    };
    const { data: inserted, error } = await supabase.from("usuarios").insert(insertPayload).select("id").single();
    if (error) {
      console.error("Erro ao inserir usuario:", error);
      throw error;
    }
    return inserted.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = normalizeEmail(emailOrPhone);
    const phoneGuess = emailOrPhone.includes("@") ? "" : emailOrPhone;

    try {
      // tenta login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error && error.message.includes("Invalid login credentials")) {
        if (isLogin) {
          // tenta criar conta automaticamente
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) throw signUpError;
          await ensureUsuarioRow(email, phoneGuess);
          toast({ title: "Conta criada!", description: "Você já pode entrar." });
          setIsLogin(true);
          setLoading(false);
          return;
        }
      }

      if (data?.session) {
        const userId = await ensureUsuarioRow(email, phoneGuess);
        localStorage.setItem("usuario_id", String(userId));
        navigate("/");
        return;
      }

      toast({ title: "Falha ao logar", description: error?.message || "Verifique suas credenciais", variant: "destructive" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro", description: err?.message || "Erro inesperado" , variant: "destructive"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 items-center">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <CardTitle className="text-2xl">Agent <span className="text-primary">IA</span></CardTitle>
          <CardDescription>Use seu telefone ou e-mail cadastrado</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Nome</Label>
                <Input id="username" placeholder="Seu nome" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail ou telefone</Label>
              <Input id="email" placeholder="email@exemplo.com ou 3899..." value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{isLogin ? "Entrar" : "Criar conta"}</Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Não tem uma conta? Criar conta" : "Já tem uma conta? Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
