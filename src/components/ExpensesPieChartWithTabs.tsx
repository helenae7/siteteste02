import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

interface ExpensesPieChartWithTabsProps {
  transactions: Transaction[];
}

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 76%, 36%)",
  "hsl(0, 84%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(160, 60%, 45%)",
];

export const ExpensesPieChartWithTabs = ({ transactions }: ExpensesPieChartWithTabsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const createChartData = (filterPaid: boolean | null) => {
    const expenses = transactions.filter((t) => {
      const isExpense = t.tipo === "despesa";
      if (filterPaid === null) return isExpense;
      return isExpense && t.esta_pago === filterPaid;
    });

    const grouped = expenses.reduce((acc: any, t) => {
      const category = t.descricao;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(t.valor);
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value: value as number,
    }));
  };

  const renderChart = (data: any[]) => {
    if (data.length === 0) {
      return <p className="text-center text-muted-foreground py-8">Nenhuma despesa encontrada</p>;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(item.value)}</div>
                <div className="text-xs text-muted-foreground">
                  {((item.value / total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="animate-slide-up-delay-2">
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="paid">Pagos</TabsTrigger>
            <TabsTrigger value="unpaid">A Pagar</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            {renderChart(createChartData(null))}
          </TabsContent>
          <TabsContent value="paid" className="mt-4">
            {renderChart(createChartData(true))}
          </TabsContent>
          <TabsContent value="unpaid" className="mt-4">
            {renderChart(createChartData(false))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
