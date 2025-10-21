import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinanceSummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "income" | "expense" | "balance";
}

export const FinanceSummaryCard = ({ title, value, icon: Icon, variant }: FinanceSummaryCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      variant === "income" && "border-success/20 bg-gradient-to-br from-success/5 to-success/10",
      variant === "expense" && "border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10",
      variant === "balance" && "border-primary/20 bg-gradient-card"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className={cn(
              "text-3xl font-bold mt-2",
              variant === "income" && "text-success",
              variant === "expense" && "text-destructive",
              variant === "balance" && "text-foreground"
            )}>
              {formatCurrency(value)}
            </h3>
          </div>
          <div className={cn(
            "p-3 rounded-full",
            variant === "income" && "bg-success/10",
            variant === "expense" && "bg-destructive/10",
            variant === "balance" && "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              variant === "income" && "text-success",
              variant === "expense" && "text-destructive",
              variant === "balance" && "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
