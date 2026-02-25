import { useState } from "react";

interface ProfileAboutSectionProps {
  bio?: string | null;
  profileType: string;
}

const profileTypeLabels: Record<string, string> = {
  casal: "Casal",
  casal_2m: "Casal (2 mulheres)",
  casal_2h: "Casal (2 homens)",
  homem: "Homem",
  homem_trans: "Homem trans",
  mulher: "Mulher",
  mulher_trans: "Mulher trans",
  travesti: "Travesti",
  crossdressing: "Crossdressing",
};

const ProfileAboutSection = ({ bio, profileType }: ProfileAboutSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasBio = bio && bio.trim().length > 0;
  const isLong = hasBio && bio.length > 120;

  return (
    <div className="px-6 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sobre</span>
        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
          {profileTypeLabels[profileType] || profileType}
        </span>
      </div>
      {hasBio ? (
        <p className="text-sm text-foreground leading-relaxed">
          {expanded || !isLong ? bio : `${bio.slice(0, 120)}…`}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-accent ml-1 text-sm font-medium"
            >
              {expanded ? "Ver menos" : "Ver mais"}
            </button>
          )}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">Nenhuma bio adicionada.</p>
      )}
    </div>
  );
};

export default ProfileAboutSection;
