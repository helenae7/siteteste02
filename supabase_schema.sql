-- Tabelas alvo no seu Supabase
create table if not exists public.usuarios (
  id bigserial primary key,
  created_at timestamptz default now(),
  nome text not null,
  telefone text,
  email text unique not null,
  senha text,
  mensagens int default 0,
  tem_plano boolean default false
);

create table if not exists public.transacoes (
  id bigserial primary key,
  created_at timestamptz default now(),
  data date not null default now(),
  descricao text not null,
  tipo text not null check (tipo in ('receita','despesa')),
  valor numeric not null,
  esta_pago boolean default true,
  user_id bigint not null references public.usuarios(id) on delete cascade
);

-- Desative RLS enquanto configura (ajuste conforme sua necessidade)
alter table public.usuarios disable row level security;
alter table public.transacoes disable row level security;
