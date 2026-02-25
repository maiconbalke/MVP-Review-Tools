import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PostMediaItem {
  id: string;
  postId: string;
  mediaUrl: string;
  position: number;
}

/**
 * Fetches post_media for a list of post IDs and returns a map postId -> mediaUrls[]
 */
export function usePostMedia(postIds: string[]) {
  const [mediaMap, setMediaMap] = useState<Map<string, string[]>>(new Map());

  const fetch = useCallback(async () => {
    if (postIds.length === 0) return;

    const { data } = await supabase
      .from("post_media")
      .select("post_id, media_url, position")
      .in("post_id", postIds)
      .order("position", { ascending: true });

    const map = new Map<string, string[]>();
    data?.forEach((m) => {
      const arr = map.get(m.post_id) || [];
      arr.push(m.media_url);
      map.set(m.post_id, arr);
    });
    setMediaMap(map);
  }, [postIds.join(",")]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { mediaMap, refetchMedia: fetch };
}
