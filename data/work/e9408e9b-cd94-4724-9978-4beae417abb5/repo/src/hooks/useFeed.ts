import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PostAuthor {
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  locationLabel: string | null;
}

export interface Post {
  id: string;
  author: PostAuthor;
  imageUrl: string | null;
  caption: string | null;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  createdAt: string;
}

const PAGE_SIZE = 20;

export function useFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    if (!user) return;
    setLoading(true);

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: postsData, error } = await supabase
      .from("posts")
      .select("id, user_id, image_url, caption, like_count, comment_count, created_at")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error || !postsData) {
      setLoading(false);
      return;
    }

    if (postsData.length < PAGE_SIZE) setHasMore(false);

    const userIds = [...new Set(postsData.map((p) => p.user_id))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url, location_label")
      .in("user_id", userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.user_id, p])
    );

    const postIds = postsData.map((p) => p.id);
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    const likedSet = new Set((likes ?? []).map((l) => l.post_id));

    const mapped: Post[] = postsData.map((p) => {
      const prof = profileMap.get(p.user_id);
      return {
        id: p.id,
        author: {
          userId: p.user_id,
          displayName: prof?.display_name ?? "Usuário",
          username: prof?.username ?? null,
          avatarUrl: prof?.avatar_url ?? null,
          locationLabel: prof?.location_label ?? null,
        },
        imageUrl: p.image_url,
        caption: p.caption,
        likeCount: p.like_count,
        commentCount: (p as any).comment_count ?? 0,
        hasLiked: likedSet.has(p.id),
        createdAt: p.created_at,
      };
    });

    setPosts((prev) => (append ? [...prev, ...mapped] : mapped));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchPosts(next, true);
  }, [page, hasMore, loading, fetchPosts]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!user) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              hasLiked: !p.hasLiked,
              likeCount: p.hasLiked ? Math.max(p.likeCount - 1, 0) : p.likeCount + 1,
            }
          : p
      )
    );

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.hasLiked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      if (error) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, hasLiked: true, likeCount: p.likeCount + 1 } : p
          )
        );
      }
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });
      if (error) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, hasLiked: false, likeCount: Math.max(p.likeCount - 1, 0) } : p
          )
        );
      }
    }
  }, [user, posts]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0);
  }, [fetchPosts]);

  return { posts, loading, hasMore, loadMore, toggleLike, refresh };
}
