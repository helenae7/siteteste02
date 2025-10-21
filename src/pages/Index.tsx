// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FinanceSummaryCard } from "@/components/FinanceSummaryCard";
import { TransactionsList } from "@/components/TransactionsList";
import { ExpensesPieChartWithTabs } from "@/components/ExpensesPieChartWithTabs";
import { DailyMovementChart } from "@/components/DailyMovementChart";
import { Header } from "@/components/Header";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

interface Transaction {
  id: number;
  created_at: string;
  descricao: string;
  valor: number;
  tipo: string;        // "entrada" | "saida"
  data: string;        // YYYY-MM-DD
  esta_pago: boolean;
  user_id: number;     // numérico
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/auth");
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => { fetchTransactions(); }, [dateRange]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const usuarioId = Number(localStorage.getItem("usuario_id"));

      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("user_id", usuarioId)
        .order("data", { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as transações", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = parseISO(t.data);
    return isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to });
  });

  const toKind = (t: string) => (t === "saida" ? "despesa" : t === "entrada" ? "receita" : t);

  const calculateSummary = () => {
    const income = filteredTransactions
      .filter((t) => toKind(t.tipo) === "receita")
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const expenses = filteredTransactions
      .filter((t) => toKind(t.tipo) === "despesa")
      .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);

    const balance = income - expenses;
    return { income, expenses, balance };
  };

  const summary = calculateSummary();

  return (
    <div className="min-h-screen bg-background">
      <Header dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <FinanceSummaryCard
            title="Entradas"
            value={summary.income}
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            trend="positivo"
          />
          <FinanceSummaryCard
            title="Saídas"
            value={summary.expenses}
            icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
            trend="negativo"
          />
          <FinanceSummaryCard
            title="Saldo"
            value={summary.balance}
            icon={<Wallet className="h-5 w-5 text-blue-500" />}
            trend={summary.balance >= 0 ? "positivo" : "negativo"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExpensesPieChartWithTabs transactions={filteredTransactions} />
          <TransactionsList transactions={filteredTransactions} />
        </div>

        <DailyMovementChart transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default Index;
