interface ProfileGridProps {
  items: { id: string; imageUrl: string }[];
  onItemClick?: (item: { id: string; imageUrl: string }) => void;
}

const ProfileGrid = ({ items, onItemClick }: ProfileGridProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="px-6 py-12 flex flex-col items-center gap-2">
        <p className="text-muted-foreground text-sm">Nenhuma publicação ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 p-0.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="aspect-square overflow-hidden rounded-xl cursor-pointer"
          onClick={() => onItemClick?.(item)}
        >
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

export default ProfileGrid;
