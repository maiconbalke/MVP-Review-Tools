import { useState, useEffect, useRef } from "react";
import { Camera, ChevronRight } from "lucide-react";
import BottomSheet from "./BottomSheet";
import InterestsPickerSheet from "./InterestsPickerSheet";
import OnboardingProgress from "./OnboardingProgress";
import CityAutocomplete from "./CityAutocomplete";
import { UserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfileCompletion } from "@/features/profile/profileCompletion";

interface EditProfileSheetProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: Partial<UserProfile>) => void;
}

const genderOptions = [
  { value: "casal", label: "Casal" },
  { value: "casal_2m", label: "Casal (2 mulheres)" },
  { value: "casal_2h", label: "Casal (2 homens)" },
  { value: "homem", label: "Homem" },
  { value: "homem_trans", label: "Homem Trans" },
  { value: "mulher", label: "Mulher" },
  { value: "mulher_trans", label: "Mulher Trans" },
  { value: "travesti", label: "Travesti" },
  { value: "crossdressing", label: "Cross-dressing (CD)" },
];

const EditProfileSheet = ({ open, onClose, profile, onSave }: EditProfileSheetProps) => {
  const [form, setForm] = useState<UserProfile>({ ...profile });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [interestsOpen, setInterestsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm({ ...profile });
      setErrors({});
    }
  }, [open, profile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "Imagem muito grande (máx. 2MB)" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, avatarUrl: reader.result as string }));
      setErrors((prev) => ({ ...prev, avatar: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.avatarUrl) newErrors.avatar = "Adicione uma foto para continuar";
    if (!form.username.trim()) newErrors.username = "Nome de usuário é obrigatório";
    if (!form.gender?.trim()) newErrors.gender = "Selecione um gênero";
    if (form.interests.length === 0) newErrors.interests = "Selecione pelo menos um interesse";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(form);
    onClose();
  };

  const completion = getProfileCompletion(form);

  const fieldClass =
    "w-full bg-transparent border-b border-border py-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <>
      <BottomSheet open={open && !interestsOpen} onClose={onClose} onConfirm={handleConfirm}>
        <div className="space-y-1">
          {/* Onboarding wizard progress */}
          {completion.completed < completion.total && (
            <div className="pb-3 border-b border-border">
              <OnboardingProgress profile={form} className="" />
            </div>
          )}

          {/* Avatar upload */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-foreground text-sm font-medium">Alterar Imagem</p>
              {errors.avatar && <p className="text-destructive text-xs mt-1">{errors.avatar}</p>}
            </div>
            <button onClick={() => fileRef.current?.click()} className="relative">
              <Avatar className="h-12 w-12">
                {form.avatarUrl ? (
                  <AvatarImage src={form.avatarUrl} alt="Avatar" />
                ) : (
                  <AvatarFallback className="bg-secondary">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Gender */}
          <div className="py-3 border-b border-border">
            <label className="text-foreground text-sm font-medium block mb-1">Gênero</label>
            <select
              value={form.gender || ""}
              onChange={(e) => {
                setForm((f) => ({ ...f, gender: e.target.value }));
                if (errors.gender) setErrors((prev) => ({ ...prev, gender: "" }));
              }}
              className="w-full bg-transparent text-base text-muted-foreground focus:outline-none"
            >
              <option value="" className="bg-card">Incluir Gênero</option>
              {genderOptions.map((g) => (
                <option key={g.value} value={g.value} className="bg-card">
                  {g.label}
                </option>
              ))}
            </select>
            {errors.gender && <p className="text-destructive text-xs mt-1">{errors.gender}</p>}
          </div>

          {/* Username */}
          <div className="py-3 border-b border-border">
            <label className="text-foreground text-sm font-medium block mb-1">Nome de usuário</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => {
                setForm((f) => ({ ...f, username: e.target.value }));
                if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
              }}
              placeholder="Seu nome de usuário"
              className={fieldClass}
            />
            {errors.username && <p className="text-destructive text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Interests trigger */}
          <div
            className="py-3 border-b border-border cursor-pointer"
            onClick={() => setInterestsOpen(true)}
          >
            <label className="text-foreground text-sm font-medium block mb-1">Interesses</label>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {form.interests.length > 0 ? form.interests.join(", ") : "Selecionar interesses"}
              </p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            {errors.interests && <p className="text-destructive text-xs mt-1">{errors.interests}</p>}
          </div>

          {/* Birth date */}
          <div className="py-3 border-b border-border">
            <label className="text-foreground text-sm font-medium block mb-1">Data de Nascimento</label>
            <input
              type="date"
              value={form.birthDate || ""}
              onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
              className={`${fieldClass} text-muted-foreground`}
            />
          </div>

          {/* Location with autocomplete */}
          <div className="py-3 border-b border-border">
            <label className="text-foreground text-sm font-medium block mb-1">Localização</label>
            <CityAutocomplete
              value={form.location || ""}
              onChange={(city) => {
                if (city) {
                  setForm((f) => ({
                    ...f,
                    location: city.label,
                    latitude: city.lat,
                    longitude: city.lon,
                  }));
                } else {
                  setForm((f) => ({
                    ...f,
                    location: undefined,
                    latitude: undefined,
                    longitude: undefined,
                  }));
                }
              }}
            />
          </div>

          {/* Bio */}
          <div className="py-3">
            <label className="text-foreground text-sm font-medium block mb-1">Descrição do perfil</label>
            <textarea
              value={form.bio || ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={4}
              className="w-full bg-secondary/50 rounded-lg border border-border p-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none transition-colors"
            />
          </div>
        </div>
      </BottomSheet>

      <InterestsPickerSheet
        open={interestsOpen}
        onClose={() => setInterestsOpen(false)}
        selected={form.interests}
        onConfirm={(interests) => {
          setForm((f) => ({ ...f, interests }));
          if (errors.interests) setErrors((prev) => ({ ...prev, interests: "" }));
        }}
      />
    </>
  );
};

export default EditProfileSheet;
