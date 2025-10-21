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
  id: string;
  created_at: string;
  descricao: string;
  valor: number;
  tipo: string;
  data: string;
  esta_pago: boolean;
  user_id: number;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    fetchTransactions();
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("user_id", Number(localStorage.getItem("usuario_id")))
        .order("data", { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = parseISO(t.data);
    return isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to });
  });

  const calculateSummary = () => {
    const income = filteredTransactions
      .filter((t) => t.tipo === "receita")
      .reduce((sum, t) => sum + t.valor, 0);

    const expenses = filteredTransactions
      .filter((t) => t.tipo === "despesa")
      .reduce((sum, t) => sum + Math.abs(t.valor), 0);

    const balance = income - expenses;

    return { income, expenses, balance };
  };

  const { income, expenses, balance } = calculateSummary();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header dateRange={dateRange} onDateRangeChange={setDateRange} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe suas finanças de forma simples e eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="animate-slide-up-delay-1">
            <FinanceSummaryCard
              title="Receitas"
              value={income}
              icon={TrendingUp}
              variant="income"
            />
          </div>
          <div className="animate-slide-up-delay-2">
            <FinanceSummaryCard
              title="Despesas"
              value={expenses}
              icon={TrendingDown}
              variant="expense"
            />
          </div>
          <div className="animate-slide-up-delay-3">
            <FinanceSummaryCard
              title="Saldo"
              value={balance}
              icon={Wallet}
              variant="balance"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExpensesPieChartWithTabs transactions={filteredTransactions} />
          <div className="animate-slide-up-delay-3">
            <TransactionsList transactions={filteredTransactions} />
          </div>
        </div>

        <DailyMovementChart transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default Index;
