import { Flame, Mail } from "lucide-react";

interface FeedHeaderTopProps {
  unreadInteractions?: number;
  unreadMessages?: number;
  onInteractionsClick?: () => void;
  onMessagesClick?: () => void;
}

const Badge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const FeedHeaderTop = ({
  unreadInteractions = 0,
  unreadMessages = 0,
  onInteractionsClick,
  onMessagesClick,
}: FeedHeaderTopProps) => {
  return (
    <div className="bg-card border-b border-border px-4 py-3 shrink-0 sticky top-0 z-30">
      <div className="mx-auto w-full max-w-[600px] flex items-center justify-between">
        <h1 className="text-lg font-serif text-foreground">Feed</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onInteractionsClick}
            className="relative p-2 rounded-full hover:bg-secondary/60 transition-colors"
            aria-label="Interações"
          >
            <Flame className="w-5 h-5 text-foreground" />
            <Badge count={unreadInteractions} />
          </button>
          <button
            onClick={onMessagesClick}
            className="relative p-2 rounded-full hover:bg-secondary/60 transition-colors"
            aria-label="Mensagens"
          >
            <Mail className="w-5 h-5 text-foreground" />
            <Badge count={unreadMessages} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedHeaderTop;
