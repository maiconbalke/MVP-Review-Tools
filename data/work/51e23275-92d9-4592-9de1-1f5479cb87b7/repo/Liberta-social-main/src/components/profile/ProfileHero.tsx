import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfileHeroProps {
  coverUrl?: string | null;
  avatarUrl?: string | null;
  displayName: string;
  isOnline?: boolean;
}

const ProfileHero = ({ coverUrl, avatarUrl, displayName, isOnline }: ProfileHeroProps) => {
  const initials = displayName?.slice(0, 2).toUpperCase() || "?";

  return (
    <div className="relative">
      {/* Cover */}
      <div className="h-40 w-full bg-secondary overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-muted" />
        )}
      </div>

      {/* Avatar */}
      <div className="flex justify-center -mt-14 relative z-10">
        <div className="relative">
          <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
