import { MapPin } from "lucide-react";

interface ProfileLocationSectionProps {
  location?: string | null;
}

const ProfileLocationSection = ({ location }: ProfileLocationSectionProps) => {
  if (!location || !location.trim()) return null;

  return (
    <div className="px-6 py-3 flex items-center gap-2">
      <MapPin className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{location}</span>
    </div>
  );
};

export default ProfileLocationSection;
