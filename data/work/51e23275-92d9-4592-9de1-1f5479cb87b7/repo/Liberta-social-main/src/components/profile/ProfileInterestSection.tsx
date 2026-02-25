import { Badge } from "@/components/ui/badge";

interface ProfileInterestSectionProps {
  interests: string[];
}

const ProfileInterestSection = ({ interests }: ProfileInterestSectionProps) => {
  if (!interests || interests.length === 0) return null;

  return (
    <div className="px-6 py-3 space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Interesses
      </span>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <Badge
            key={interest}
            variant="secondary"
            className="rounded-full text-xs px-3 py-1"
          >
            {interest}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ProfileInterestSection;
