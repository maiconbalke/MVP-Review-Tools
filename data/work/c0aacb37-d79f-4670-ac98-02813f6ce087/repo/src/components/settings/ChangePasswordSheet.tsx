import { useState } from "react";
import BottomSheet from "../BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ChangePasswordSheetProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordSheet = ({ open, onClose }: ChangePasswordSheetProps) => {
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setErrors({});
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!currentPw) newErrors.current = "Informe a senha atual";
    if (newPw.length < 8) newErrors.new = "Mínimo de 8 caracteres";
    if (newPw !== confirmPw) newErrors.confirm = "As senhas não coincidem";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Re-authenticate
    const email = user?.email;
    if (!email) {
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPw,
    });
    if (authError) {
      setErrors({ current: "Senha atual incorreta" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Senha alterada com sucesso" });
      resetForm();
      onClose();
    }
  };

  const handleForgot = async () => {
    const email = user?.email;
    if (!email) return;
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    toast({ title: "E-mail enviado", description: "Verifique sua caixa de entrada." });
  };

  const fieldClass =
    "w-full bg-transparent border-b border-border py-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <BottomSheet open={open} title="Alterar Senha" onClose={() => { resetForm(); onClose(); }} onConfirm={handleSave}>
      <div className="space-y-4">
        <div>
          <label className="text-foreground text-sm font-medium block mb-1">Senha atual</label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => { setCurrentPw(e.target.value); setErrors((p) => ({ ...p, current: "" })); }}
            placeholder="Sua senha atual"
            className={fieldClass}
          />
          {errors.current && <p className="text-destructive text-xs mt-1">{errors.current}</p>}
        </div>
        <div>
          <label className="text-foreground text-sm font-medium block mb-1">Nova senha</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => { setNewPw(e.target.value); setErrors((p) => ({ ...p, new: "" })); }}
            placeholder="Mínimo 8 caracteres"
            className={fieldClass}
          />
          {errors.new && <p className="text-destructive text-xs mt-1">{errors.new}</p>}
        </div>
        <div>
          <label className="text-foreground text-sm font-medium block mb-1">Repetir nova senha</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => { setConfirmPw(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }}
            placeholder="Repita a nova senha"
            className={fieldClass}
          />
          {errors.confirm && <p className="text-destructive text-xs mt-1">{errors.confirm}</p>}
        </div>

        <button
          onClick={handleForgot}
          className="text-primary text-sm underline underline-offset-4 mt-2"
        >
          Esqueci minha senha
        </button>
      </div>
    </BottomSheet>
  );
};

export default ChangePasswordSheet;
