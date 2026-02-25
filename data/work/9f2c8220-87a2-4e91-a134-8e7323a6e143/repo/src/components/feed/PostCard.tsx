import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LikeButtonFire from "./LikeButtonFire";
import PostCarousel from "./PostCarousel";
import CommentsSheet from "./CommentsSheet";
import type { Post } from "@/hooks/useFeed";

interface PostCardProps {
  post: Post;
  mediaUrls?: string[];
  onToggleLike: (postId: string) => void;
  onAuthorClick?: (userId: string) => void;
}

const PostCard = ({ post, mediaUrls, onToggleLike, onAuthorClick }: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);
  const { author } = post;
  const initials = author.displayName.slice(0, 2).toUpperCase();
  const timeAgo = getTimeAgo(post.createdAt);

  // Build image list: prefer mediaUrls, fallback to post.imageUrl
  const allMedia = mediaUrls && mediaUrls.length > 0
    ? mediaUrls
    : post.imageUrl
      ? [post.imageUrl]
      : [];

  return (
    <>
      <article className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          onClick={() => onAuthorClick?.(author.userId)}
        >
          <Avatar className="w-10 h-10 border-2 border-accent/30">
            {author.avatarUrl ? (
              <AvatarImage src={author.avatarUrl} alt={author.displayName} />
            ) : null}
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-foreground text-sm font-semibold truncate">
                {author.displayName}
              </span>
              {author.username && (
                <span className="text-muted-foreground text-xs truncate">
                  @{author.username}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              {author.locationLabel && <span>{author.locationLabel}</span>}
              {author.locationLabel && <span>•</span>}
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Media */}
        {allMedia.length > 0 && <PostCarousel urls={allMedia} />}

        {/* Actions */}
        <div className="flex items-center gap-5 px-4 py-3">
          <LikeButtonFire
            liked={post.hasLiked}
            count={post.likeCount}
            onToggle={() => onToggleLike(post.id)}
          />
          <button
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setCommentsOpen(true)}
          >
            <MessageCircle className="w-5 h-5" />
            {commentCount > 0 && (
              <span className="text-sm tabular-nums">{commentCount}</span>
            )}
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-4 pb-3">
            <p
              className={`text-foreground text-sm leading-relaxed ${
                !expanded ? "line-clamp-3" : ""
              }`}
            >
              <span className="font-semibold mr-1">{author.displayName}</span>
              {post.caption}
            </p>
            {!expanded && post.caption.length > 120 && (
              <button
                onClick={() => setExpanded(true)}
                className="text-muted-foreground text-xs mt-0.5"
              >
                ver mais
              </button>
            )}
          </div>
        )}
      </article>

      <CommentsSheet
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={post.id}
        onCommentCountChange={setCommentCount}
      />
    </>
  );
};

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

export default PostCard;
