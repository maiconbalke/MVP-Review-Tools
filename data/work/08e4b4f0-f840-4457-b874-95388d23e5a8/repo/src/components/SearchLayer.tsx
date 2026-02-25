import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, UserPlus, Clock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes";

interface SearchProfile {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  profile_type: string;
  location_label: string | null;
}

type ConnState = "none" | "sent" | "received" | "connected";

interface ConnInfo {
  state: ConnState;
  id: string | null;
}

const PAGE_SIZE = 20;

const profileTypeLabel: Record<string, string> = {
  casal: "Casal",
  casal_2m: "Casal (2M)",
  casal_2h: "Casal (2H)",
  homem: "Homem",
  homem_trans: "Homem Trans",
  mulher: "Mulher",
  mulher_trans: "Mulher Trans",
  travesti: "Travesti",
  crossdressing: "CD",
};

const SearchLayer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { blockedIds } = useBlockedUsers();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchProfile[]>([]);
  const [connMap, setConnMap] = useState<Map<string, ConnInfo>>(new Map());
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch connections map
  const fetchConnections = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("connections")
      .select("id, requester_id, receiver_id, status")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    const map = new Map<string, ConnInfo>();
    data?.forEach((c) => {
      const targetId = c.requester_id === user.id ? c.receiver_id : c.requester_id;
      let state: ConnState = "none";
      if (c.status === "accepted") state = "connected";
      else if (c.status === "pending") {
        state = c.requester_id === user.id ? "sent" : "received";
      }
      map.set(targetId, { state, id: c.id });
    });
    setConnMap(map);
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Search
  const search = useCallback(
    async (q: string, pageNum: number, append: boolean) => {
      if (!user) return;
      setLoading(true);

      let qb = supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url, profile_type, location_label")
        .neq("user_id", user.id)
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)
        .order("created_at", { ascending: false });

      if (q.trim()) {
        qb = qb.or(`display_name.ilike.%${q}%,username.ilike.%${q}%`);
      }

      const { data } = await qb;

      if (data) {
        const filtered = data.filter((p) => !blockedIds.has(p.user_id));
        setResults((prev) => (append ? [...prev, ...filtered] : filtered));
        setHasMore(data.length === PAGE_SIZE);
      }
      setLoading(false);
    },
    [user]
  );

  useEffect(() => {
    pageRef.current = 0;
    search(debouncedQuery, 0, false);
  }, [debouncedQuery, search]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          pageRef.current += 1;
          search(debouncedQuery, pageRef.current, true);
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, debouncedQuery, search]);

  // Connection actions
  const requestConnection = async (targetId: string) => {
    if (!user) return;
    await supabase.from("connections").insert({
      requester_id: user.id,
      receiver_id: targetId,
      status: "pending",
    });
    await fetchConnections();
  };

  const acceptConnection = async (connId: string) => {
    await supabase.from("connections").update({ status: "accepted" }).eq("id", connId);
    await fetchConnections();
  };

  const rejectConnection = async (connId: string) => {
    await supabase.from("connections").update({ status: "rejected" }).eq("id", connId);
    await fetchConnections();
  };

  const getConn = (userId: string): ConnInfo =>
    connMap.get(userId) || { state: "none", id: null };

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 pb-[calc(64px+16px)]">
      {/* Search bar */}
      <div className="flex items-center gap-2 py-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar perfis…"
            className="w-full h-10 pl-9 pr-4 rounded-full bg-secondary border border-border text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {results.map((p) => {
          const conn = getConn(p.user_id);
          return (
            <div
              key={p.user_id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => navigate(`${ROUTES.PROFILE}/${p.user_id}`)}
            >
              <Avatar className="h-12 w-12 shrink-0">
                {p.avatar_url ? <AvatarImage src={p.avatar_url} /> : null}
                <AvatarFallback className="bg-secondary text-foreground text-sm">
                  {p.display_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">
                  {p.display_name}
                </p>
                <p className="text-muted-foreground text-xs truncate">
                  {p.profile_type && (
                    <span>{profileTypeLabel[p.profile_type] || p.profile_type}</span>
                  )}
                  {p.location_label && <span> · {p.location_label}</span>}
                </p>
              </div>

              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                {conn.state === "none" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs h-8 px-3"
                    onClick={() => requestConnection(p.user_id)}
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    Conectar
                  </Button>
                )}
                {conn.state === "sent" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs h-8 px-3"
                    disabled
                  >
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Enviado
                  </Button>
                )}
                {conn.state === "received" && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="rounded-full text-xs h-8 px-3 bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => conn.id && acceptConnection(conn.id)}
                    >
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs h-8 px-2"
                      onClick={() => conn.id && rejectConnection(conn.id)}
                    >
                      ✕
                    </Button>
                  </div>
                )}
                {conn.state === "connected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs h-8 px-3"
                    disabled
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Conectados
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {query ? "Nenhum perfil encontrado." : "Digite para buscar perfis."}
          </div>
        )}

        {hasMore && <div ref={sentinelRef} className="h-4" />}
      </div>
    </div>
  );
};

export default SearchLayer;
