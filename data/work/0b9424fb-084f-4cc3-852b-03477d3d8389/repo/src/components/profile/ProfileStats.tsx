interface ProfileStatsProps {
  connectionsCount: number;
  photosCount: number;
  reputationScore: number;
}

const ProfileStats = ({ connectionsCount, photosCount, reputationScore }: ProfileStatsProps) => {
  const stats = [
    { label: "Conexões", value: connectionsCount },
    { label: "Fotos", value: photosCount },
    { label: "Reputação", value: reputationScore },
  ];

  return (
    <div className="flex justify-center gap-10 py-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center">
          <span className="text-lg font-semibold text-foreground">{stat.value}</span>
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
