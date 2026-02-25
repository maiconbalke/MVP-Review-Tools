import { useState, useEffect } from "react";
import BottomSheet from "../BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChangePhoneSheetProps {
  open: boolean;
  onClose: () => void;
}

const ChangePhoneSheet = ({ open, onClose }: ChangePhoneSheetProps) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("phone, phone_verified")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPhone(data.phone || "");
        setVerified(data.phone_verified || false);
      }
    };
    load();
  }, [open, user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ phone: phone.trim() || null, phone_verified: false })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setVerified(false);
      toast({ title: "Telefone salvo", description: "Verificação por SMS em breve." });
      onClose();
    }
  };

  const fieldClass =
    "w-full bg-transparent border-b border-border py-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <BottomSheet open={open} title="Alterar Telefone" onClose={onClose} onConfirm={handleSave}>
      <div className="space-y-4">
        <div>
          <label className="text-foreground text-sm font-medium block mb-1">Telefone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+55 11 99999-9999"
            className={fieldClass}
          />
        </div>

        {verified && (
          <div className="flex items-center gap-2 text-primary text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Telefone verificado</span>
          </div>
        )}

        {!verified && phone.trim() && (
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground text-sm font-medium">Verificação por SMS</p>
            </div>
            <p className="text-muted-foreground text-xs mb-3">
              A verificação por SMS estará disponível em breve. Por enquanto, salve seu número para uso futuro.
            </p>
            <Button size="sm" variant="outline" className="rounded-full text-xs" disabled>
              Enviar código (em breve)
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default ChangePhoneSheet;
