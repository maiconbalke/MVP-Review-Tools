import { useState, useEffect } from "react";
import BottomSheet from "../BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const visibilityOptions = [
  { value: "everyone", label: "Todos" },
  { value: "connections", label: "Somente conexões (amigos)" },
  { value: "selected_photos", label: "Apenas algumas fotos selecionadas" },
];

const profileTypes = [
  { value: "homem", label: "Homem" },
  { value: "mulher", label: "Mulher" },
  { value: "casal", label: "Casal" },
  { value: "casal_2m", label: "Casal (2M)" },
  { value: "casal_2h", label: "Casal (2H)" },
  { value: "homem_trans", label: "Homem Trans" },
  { value: "mulher_trans", label: "Mulher Trans" },
  { value: "travesti", label: "Travesti" },
  { value: "crossdressing", label: "CD" },
];

interface PrivacySheetProps {
  open: boolean;
  onClose: () => void;
}

const PrivacySheet = ({ open, onClose }: PrivacySheetProps) => {
  const { user } = useAuth();
  const [visibility, setVisibility] = useState("everyone");
  const [allowedTypes, setAllowedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    const load = async () => {
      const { data } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setVisibility(data.profile_visibility);
        setAllowedTypes(data.allowed_types || []);
      } else {
        setVisibility("everyone");
        setAllowedTypes([]);
      }
    };
    load();
  }, [open, user]);

  const toggleType = (type: string) => {
    setAllowedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("privacy_settings").upsert(
      {
        user_id: user.id,
        profile_visibility: visibility,
        allowed_types: allowedTypes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Privacidade atualizada" });
      onClose();
    }
  };

  return (
    <BottomSheet open={open} title="Privacidade" onClose={onClose} onConfirm={handleSave}>
      <div className="space-y-6">
        {/* Visibility */}
        <div>
          <p className="text-foreground text-sm font-medium mb-3">Quem pode ver meu perfil?</p>
          <div className="space-y-2">
            {visibilityOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === opt.value}
                  onChange={() => setVisibility(opt.value)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-foreground text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Allowed types */}
        <div>
          <p className="text-foreground text-sm font-medium mb-1">Tipos que podem ver</p>
          <p className="text-muted-foreground text-xs mb-3">
            Se nenhum tipo estiver marcado, todos os tipos podem ver.
          </p>
          <div className="flex flex-wrap gap-2">
            {profileTypes.map((pt) => {
              const active = allowedTypes.includes(pt.value);
              return (
                <button
                  key={pt.value}
                  onClick={() => toggleType(pt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {pt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default PrivacySheet;
