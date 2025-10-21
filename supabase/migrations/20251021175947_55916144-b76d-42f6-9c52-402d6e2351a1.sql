-- Criar tabela de transações
CREATE TABLE public.transacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  esta_pago BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir acesso total (temporário para desenvolvimento)
CREATE POLICY "Permitir leitura de todas as transações" 
ON public.transacoes 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção de transações" 
ON public.transacoes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização de transações" 
ON public.transacoes 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir exclusão de transações" 
ON public.transacoes 
FOR DELETE 
USING (true);

-- Criar índice para melhorar performance
CREATE INDEX idx_transacoes_data ON public.transacoes(data DESC);
CREATE INDEX idx_transacoes_tipo ON public.transacoes(tipo);
CREATE INDEX idx_transacoes_user_id ON public.transacoes(user_id);

-- Inserir alguns dados de exemplo
INSERT INTO public.transacoes (descricao, valor, tipo, data, esta_pago, user_id) VALUES
  ('Salário', 5000.00, 'receita', '2025-01-15', true, gen_random_uuid()),
  ('Aluguel', 1200.00, 'despesa', '2025-01-05', true, gen_random_uuid()),
  ('Supermercado', 450.00, 'despesa', '2025-01-10', true, gen_random_uuid()),
  ('Freelance', 1500.00, 'receita', '2025-01-20', true, gen_random_uuid()),
  ('Internet', 99.90, 'despesa', '2025-01-08', true, gen_random_uuid()),
  ('Transporte', 200.00, 'despesa', '2025-01-12', false, gen_random_uuid()),
  ('Academia', 150.00, 'despesa', '2025-01-03', true, gen_random_uuid()),
  ('Energia Elétrica', 180.00, 'despesa', '2025-01-07', false, gen_random_uuid());