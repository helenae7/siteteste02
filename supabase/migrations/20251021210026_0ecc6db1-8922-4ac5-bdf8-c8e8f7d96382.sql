-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Atualizar a tabela transacoes para garantir user_id correto
ALTER TABLE public.transacoes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.transacoes ALTER COLUMN user_id SET NOT NULL;

-- Remover políticas RLS antigas da tabela transacoes
DROP POLICY IF EXISTS "Permitir leitura de todas as transações" ON public.transacoes;
DROP POLICY IF EXISTS "Permitir inserção de transações" ON public.transacoes;
DROP POLICY IF EXISTS "Permitir atualização de transações" ON public.transacoes;
DROP POLICY IF EXISTS "Permitir exclusão de transações" ON public.transacoes;

-- Criar novas políticas RLS baseadas em autenticação
CREATE POLICY "Usuários podem ver suas próprias transações"
  ON public.transacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias transações"
  ON public.transacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações"
  ON public.transacoes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias transações"
  ON public.transacoes FOR DELETE
  USING (auth.uid() = user_id);