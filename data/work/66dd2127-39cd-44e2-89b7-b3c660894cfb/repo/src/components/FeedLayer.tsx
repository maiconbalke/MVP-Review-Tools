import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Flame } from "lucide-react";
import { useFeed } from "@/hooks/useFeed";
import { usePostMedia } from "@/hooks/usePostMedia";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getProfileCompletion } from "@/features/profile/profileCompletion";
import PostCard from "@/components/feed/PostCard";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import { ROUTES } from "@/routes";

interface FeedLayerProps {
  profileComplete: boolean;
  onCompleteProfile: () => void;
}

const FeedLayer = ({ profileComplete, onCompleteProfile }: FeedLayerProps) => {
  const { profile } = useUserProfile();
  const completion = getProfileCompletion(profile);
  const navigate = useNavigate();
  const { posts, loading, hasMore, loadMore, toggleLike } = useFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const postIds = posts.map((p) => p.id);
  const { mediaMap } = usePostMedia(postIds);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (!profileComplete) {
    return (
      <div className="mx-auto w-full max-w-[600px] px-4 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-serif text-foreground">Acesso ao feed bloqueado</h2>
        <p className="text-muted-foreground text-sm">
          Complete seu perfil ({completion.completed}/{completion.total}) para liberar o feed.
        </p>
        <button
          onClick={onCompleteProfile}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          Completar perfil
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 py-4 pb-[calc(64px+16px)]">
      {loading && posts.length === 0 ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-3">
          <Flame className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Nenhum post ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              mediaUrls={mediaMap.get(post.id)}
              onToggleLike={toggleLike}
              onAuthorClick={(userId) => navigate(`${ROUTES.PROFILE}/${userId}`)}
            />
          ))}
          {hasMore && <div ref={sentinelRef}><FeedSkeleton /></div>}
        </div>
      )}
    </div>
  );
};

export default FeedLayer;
