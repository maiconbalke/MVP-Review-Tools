import { useState } from "react";
import BottomSheet from "../BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface ChangeEmailSheetProps {
  open: boolean;
  onClose: () => void;
}

const ChangeEmailSheet = ({ open, onClose }: ChangeEmailSheetProps) => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSave = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast({ title: "Informe um e-mail válido", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Confirmação enviada", description: "Verifique seu novo e-mail para concluir." });
    }
  };

  const handleClose = () => {
    setNewEmail("");
    setSent(false);
    onClose();
  };

  const fieldClass =
    "w-full bg-transparent border-b border-border py-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <BottomSheet open={open} title="Alterar Email" onClose={handleClose} onConfirm={sent ? undefined : handleSave}>
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground text-xs mb-3">
            E-mail atual: <span className="text-foreground">{user?.email}</span>
          </p>
        </div>

        {!sent ? (
          <div>
            <label className="text-foreground text-sm font-medium block mb-1">Novo e-mail</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novoemail@exemplo.com"
              className={fieldClass}
            />
          </div>
        ) : (
          <div className="text-center py-6">
            <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="text-foreground text-sm font-medium">Confirmação enviada</p>
            <p className="text-muted-foreground text-xs mt-2">
              Verifique a caixa de entrada do novo e-mail para confirmar a alteração.
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default ChangeEmailSheet;
