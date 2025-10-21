import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY =
  (import.meta.env as any).VITE_SUPABASE_ANON_KEY ||
  (import.meta.env as any).VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Mostra erro visível em produção se faltar ENV (muito comum)
  console.error("VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes.");
  alert("Configuração do Supabase ausente. Defina as variáveis no Vercel.");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "", {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
});
