import { useState, useEffect } from "react";
import {
  Camera, Users, ThumbsUp, Eye, Star, Edit, Shield,
  Ban, Key, Mail, Phone, ChevronRight, Diamond, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isProfileComplete } from "@/features/profile/profileCompletion";
import EditProfileSheet from "./EditProfileSheet";
import OnboardingProgress from "./OnboardingProgress";
import PrivacySheet from "./settings/PrivacySheet";
import BlocksSheet from "./settings/BlocksSheet";
import ChangePasswordSheet from "./settings/ChangePasswordSheet";
import ChangeEmailSheet from "./settings/ChangeEmailSheet";
import ChangePhoneSheet from "./settings/ChangePhoneSheet";
import { ROUTES } from "@/routes";

interface SettingsLayerProps {
  forceEditOpen?: boolean;
  onForceEditClose?: () => void;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
}

const SettingsItem = ({ icon, label, value, onClick }: SettingsItemProps) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between py-3.5 px-4 hover:bg-secondary/50 transition-colors cursor-pointer"
  >
    <div className="flex items-center gap-3">
      <span className="text-primary">{icon}</span>
      <span className="text-foreground text-sm">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-muted-foreground text-xs">{value}</span>}
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  </div>
);

type Sheet = null | "privacy" | "blocks" | "password" | "email" | "phone";

const SettingsLayer = ({ forceEditOpen, onForceEditClose }: SettingsLayerProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);

  const complete = isProfileComplete(profile);

  useEffect(() => {
    if (forceEditOpen) setEditOpen(true);
  }, [forceEditOpen]);

  const handleEditClose = () => {
    setEditOpen(false);
    onForceEditClose?.();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 pb-[calc(64px+16px)]">
      <OnboardingProgress profile={profile} />

      {/* Profile Card */}
      <div className="bg-card mt-4 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Perfil atual</p>
          <p className="text-foreground font-medium">
            {profile.username || "Usuário"}
          </p>
        </div>
        <span
          className="text-primary text-sm flex items-center gap-1 cursor-pointer"
          onClick={() => navigate(ROUTES.PROFILE)}
        >
          Ver meu perfil <ChevronRight className="w-4 h-4" />
        </span>
      </div>

      {/* Premium Banner */}
      <div className="bg-card mt-3 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors">
        <Diamond className="w-5 h-5 text-primary" />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Stats */}
      <div className="bg-card mt-4 rounded-xl overflow-hidden divide-y divide-border">
        <SettingsItem icon={<Camera className="w-5 h-5" />} label="Minhas fotos" value="0" />
        <SettingsItem icon={<Users className="w-5 h-5" />} label="Amigos e Seguidores" value="0" />
        <SettingsItem icon={<ThumbsUp className="w-5 h-5" />} label="Aprovar Indicações" value="0" />
        <SettingsItem icon={<Eye className="w-5 h-5" />} label="Quem me viu" value="0" />
        <SettingsItem icon={<Star className="w-5 h-5" />} label="Minha Reputação" value="0" />
      </div>

      {/* Settings */}
      <h3 className="text-sm text-muted-foreground font-medium mt-6 mb-2">Configurações</h3>
      <div className="bg-card rounded-xl overflow-hidden divide-y divide-border">
        <SettingsItem
          icon={<Edit className="w-5 h-5" />}
          label="Editar Perfil"
          onClick={() => setEditOpen(true)}
        />
        <SettingsItem
          icon={<Shield className="w-5 h-5" />}
          label="Privacidade"
          onClick={() => setActiveSheet("privacy")}
        />
        <SettingsItem
          icon={<Ban className="w-5 h-5" />}
          label="Bloqueios"
          onClick={() => setActiveSheet("blocks")}
        />
        <SettingsItem
          icon={<Key className="w-5 h-5" />}
          label="Alterar Senha"
          onClick={() => setActiveSheet("password")}
        />
        <SettingsItem
          icon={<Mail className="w-5 h-5" />}
          label="Alterar Email"
          onClick={() => setActiveSheet("email")}
        />
        <SettingsItem
          icon={<Phone className="w-5 h-5" />}
          label="Alterar Telefone"
          onClick={() => setActiveSheet("phone")}
        />
        <SettingsItem
          icon={<LogOut className="w-5 h-5" />}
          label="Sair"
          onClick={handleSignOut}
        />
      </div>

      <EditProfileSheet
        open={editOpen}
        onClose={handleEditClose}
        profile={profile}
        onSave={updateProfile}
      />

      <PrivacySheet open={activeSheet === "privacy"} onClose={() => setActiveSheet(null)} />
      <BlocksSheet open={activeSheet === "blocks"} onClose={() => setActiveSheet(null)} />
      <ChangePasswordSheet open={activeSheet === "password"} onClose={() => setActiveSheet(null)} />
      <ChangeEmailSheet open={activeSheet === "email"} onClose={() => setActiveSheet(null)} />
      <ChangePhoneSheet open={activeSheet === "phone"} onClose={() => setActiveSheet(null)} />
    </div>
  );
};

export default SettingsLayer;
