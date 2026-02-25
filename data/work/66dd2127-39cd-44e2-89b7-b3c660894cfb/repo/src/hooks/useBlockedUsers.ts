import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBlockedUsers() {
  const { user } = useAuth();
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [blockedByIds, setBlockedByIds] = useState<Set<string>>(new Set());

  const fetch = useCallback(async () => {
    if (!user) return;
    // Users I blocked
    const { data: myBlocks } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    setBlockedIds(new Set(myBlocks?.map((b) => b.blocked_id) || []));

    // Users who blocked me (we can't query this with RLS, so we skip for now)
    // This would require a server-side function; for now we filter our own blocks
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const blockUser = async (targetId: string) => {
    if (!user) return;
    await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: targetId });
    // Also remove any existing connection
    await supabase.from("connections").delete().or(
      `and(requester_id.eq.${user.id},receiver_id.eq.${targetId}),and(requester_id.eq.${targetId},receiver_id.eq.${user.id})`
    );
    await fetch();
  };

  const unblockUser = async (targetId: string) => {
    if (!user) return;
    await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", targetId);
    await fetch();
  };

  const isBlocked = (targetId: string) => blockedIds.has(targetId);

  return { blockedIds, isBlocked, blockUser, unblockUser, refetch: fetch };
}
