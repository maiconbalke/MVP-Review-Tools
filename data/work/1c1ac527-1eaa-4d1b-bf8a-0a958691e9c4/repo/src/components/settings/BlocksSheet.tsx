import { useState, useEffect } from "react";
import BottomSheet from "../BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ShieldOff } from "lucide-react";

interface BlockedUser {
  id: string;
  blocked_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
}

interface BlocksSheetProps {
  open: boolean;
  onClose: () => void;
}

const BlocksSheet = ({ open, onClose }: BlocksSheetProps) => {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlocks = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("blocks")
      .select("id, blocked_id")
      .eq("blocker_id", user.id);

    if (data && data.length > 0) {
      const blockedIds = data.map((b) => b.blocked_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .in("user_id", blockedIds);

      const merged = data.map((b) => {
        const p = profiles?.find((p) => p.user_id === b.blocked_id);
        return {
          id: b.id,
          blocked_id: b.blocked_id,
          display_name: p?.display_name || "Usuário",
          username: p?.username || null,
          avatar_url: p?.avatar_url || null,
        };
      });
      setBlocks(merged);
    } else {
      setBlocks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchBlocks();
  }, [open, user]);

  const unblock = async (blockId: string) => {
    await supabase.from("blocks").delete().eq("id", blockId);
    toast({ title: "Usuário desbloqueado" });
    fetchBlocks();
  };

  return (
    <BottomSheet open={open} title="Bloqueios" onClose={onClose}>
      <div className="space-y-2">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && blocks.length === 0 && (
          <div className="text-center py-12">
            <ShieldOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Você ainda não bloqueou ninguém.</p>
          </div>
        )}

        {blocks.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border"
          >
            <Avatar className="h-10 w-10 shrink-0">
              {b.avatar_url ? <AvatarImage src={b.avatar_url} /> : null}
              <AvatarFallback className="bg-secondary text-foreground text-sm">
                {b.display_name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-medium truncate">{b.display_name}</p>
              {b.username && (
                <p className="text-muted-foreground text-xs truncate">@{b.username}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs h-8 px-3"
              onClick={() => unblock(b.id)}
            >
              Desbloquear
            </Button>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
};

export default BlocksSheet;
