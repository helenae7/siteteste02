import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  created_at: string;
  descricao: string;
  valor: number;
  tipo: string;
  data: string;
  esta_pago: boolean;
  user_id: string;
}

interface DailyMovementChartProps {
  transactions: Transaction[];
}

export const DailyMovementChart = ({ transactions }: DailyMovementChartProps) => {
  const dailyData = transactions.reduce((acc: any, t) => {
    const date = format(parseISO(t.data), "dd/MM", { locale: ptBR });
    if (!acc[date]) {
      acc[date] = { date, receitas: 0, despesas: 0 };
    }
    if (t.tipo === "receita") {
      acc[date].receitas += t.valor;
    } else {
      acc[date].despesas += Math.abs(t.valor);
    }
    return acc;
  }, {});

  const chartData = Object.values(dailyData).slice(-10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="animate-slide-up-delay-3">
      <CardHeader>
        <CardTitle>Movimentação Diária</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="receitas" fill="hsl(var(--success))" name="Receitas" radius={[8, 8, 0, 0]} />
            <Bar dataKey="despesas" fill="hsl(var(--destructive))" name="Despesas" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
