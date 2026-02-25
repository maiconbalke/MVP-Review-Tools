import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ConnectionState = "none" | "sent" | "received" | "connected";

interface ConnectionRow {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
}

export function useConnectionStatus(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [state, setState] = useState<ConnectionState>("none");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.id;

  const refresh = useCallback(async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setState("none");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("connections")
      .select("id, requester_id, receiver_id, status")
      .or(
        `and(requester_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`
      )
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setState("none");
      setConnectionId(null);
    } else {
      const row = data as ConnectionRow;
      setConnectionId(row.id);
      if (row.status === "accepted") {
        setState("connected");
      } else if (row.status === "pending") {
        setState(row.requester_id === currentUserId ? "sent" : "received");
      } else {
        setState("none");
      }
    }
    setLoading(false);
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requestConnection = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    await supabase.from("connections").insert({
      requester_id: currentUserId,
      receiver_id: targetUserId,
      status: "pending",
    });
    await refresh();
  }, [currentUserId, targetUserId, refresh]);

  const acceptConnection = useCallback(async () => {
    if (!connectionId) return;
    await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connectionId);
    await refresh();
  }, [connectionId, refresh]);

  const rejectConnection = useCallback(async () => {
    if (!connectionId) return;
    await supabase
      .from("connections")
      .update({ status: "rejected" })
      .eq("id", connectionId);
    await refresh();
  }, [connectionId, refresh]);

  return {
    state,
    loading,
    requestConnection,
    acceptConnection,
    rejectConnection,
    isOwnProfile: currentUserId === targetUserId,
  };
}
