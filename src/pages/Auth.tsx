import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png"; // será trocada no passo 2

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false); // começa em "Criar conta" no seu print
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
    if (!value) return "";
    return value.includes("@") ? value.trim() : `${value.replace(/\D/g, "")}@iazapuser.com`;
  };

  const ensureUsuarioRow = async (email: string, phoneGuess?: string) => {
    // procura por email na sua tabela `usuarios`
    const { data: found } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (found?.id) return found.id;

    const insertPayload: any = {
      nome: username || "Usuário",
      email,
      telefone: phoneGuess || null,
      mensagens: 0,
      tem_plano: false,
      // senha NÃO é salva no banco de dados
    };

    const { data: inserted, error } = await supabase
      .from("usuarios")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) throw error;
    return inserted.id;
  };

  const handleLogin = async (email: string) => {
    // garante linha em `usuarios` e salva id
    const userId = await ensureUsuarioRow(email, emailOrPhone.includes("@") ? "" : emailOrPhone);
    localStorage.setItem("usuario_id", String(userId));
    toast({ title: "Login realizado!" });
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = normalizeEmail(emailOrPhone);
    if (!email || !password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // ===== ENTRAR =====
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.session) await handleLogin(email);
        return;
      } else {
        // ===== CRIAR CONTA =====
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        // se seu projeto exigir confirmação de e-mail, desative em:
        // Auth → Providers → Email → desmarcar "Confirm email before sign in"
        // ou então aqui forçamos o login logo em seguida:
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        if (data?.session) await handleLogin(email);

        toast({ title: "Conta criada com sucesso!" });
        return;
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: isLogin ? "Falha ao logar" : "Falha ao criar conta",
        description: err?.message || "Verifique as credenciais",
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
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <CardTitle className="text-2xl">
            Agent <span className="text-primary">IA</span>
          </CardTitle>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {isLogin ? "Entrar" : "Criar conta"}
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
