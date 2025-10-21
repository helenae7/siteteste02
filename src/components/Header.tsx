// src/components/Header.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/gestor-ia.png";
import { DateRangeFilter } from "./DateRangeFilter";

interface HeaderProps {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export const Header: React.FC<HeaderProps> = ({ dateRange, onDateRangeChange }) => {
  const [username, setUsername] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const { data: profile } = await supabase
            .from("usuarios")
            .select("nome, email")
            .eq("email", user.email)
            .single();

          if (profile?.nome) setUsername(profile.nome);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Logout realizado com sucesso!", description: "Até logo!" });
      localStorage.removeItem("usuario_id");
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Erro ao sair", description: error?.message, variant: "destructive" });
    }
  };

  const initials = (username || "Usuário")
    .split(" ")
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <img src={logo} alt="GESTOR IA" className="h-12 w-auto" />

          <div className="flex items-center gap-4">
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={onDateRangeChange} />

            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <span className="font-medium">{username || "Usuário"}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
