import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { DateRangeFilter } from "./DateRangeFilter";

interface HeaderProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export const Header = ({ dateRange, onDateRangeChange }: HeaderProps) => {
  const [username, setUsername] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("usuarios")
          .select("nome, email")
          .eq("email", user.email)
          .single();

        if (profile) {
          setUsername(profile.username);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });

      navigate("/auth");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="border-b border-border bg-card shadow-sm animate-fade-in">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <img src={logo} alt="ZAP i/A Logo" className="h-12 w-auto" />
          
          <div className="flex items-center gap-4">
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
            
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {username ? getInitials(username) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {username || "Usuário"}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
