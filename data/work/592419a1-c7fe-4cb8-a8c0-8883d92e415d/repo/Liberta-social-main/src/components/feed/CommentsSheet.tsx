import { useState, useEffect, useCallback, useRef } from "react";
import { Send, CornerDownRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomSheet from "@/components/BottomSheet";

interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author: {
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
  };
  replies: Comment[];
}

interface CommentsSheetProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  onCommentCountChange?: (count: number) => void;
}

const CommentsSheet = ({ open, onClose, postId, onCommentCountChange }: CommentsSheetProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<{ user_id: string; display_name: string; username: string | null }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);

    const { data: rawComments } = await supabase
      .from("post_comments")
      .select("id, post_id, user_id, parent_id, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!rawComments || rawComments.length === 0) {
      setComments([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(rawComments.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    const mapped: Comment[] = rawComments.map((c) => {
      const prof = profileMap.get(c.user_id);
      return {
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        parentId: c.parent_id,
        content: c.content,
        createdAt: c.created_at,
        author: {
          displayName: prof?.display_name ?? "Usuário",
          username: prof?.username ?? null,
          avatarUrl: prof?.avatar_url ?? null,
        },
        replies: [],
      };
    });

    // Build tree
    const rootComments: Comment[] = [];
    const byId = new Map(mapped.map((c) => [c.id, c]));
    mapped.forEach((c) => {
      if (c.parentId) {
        const parent = byId.get(c.parentId);
        if (parent) parent.replies.push(c);
      } else {
        rootComments.push(c);
      }
    });

    setComments(rootComments);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (open) fetchComments();
  }, [open, fetchComments]);

  // Mention search
  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) {
      setMentionResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .or(`display_name.ilike.%${mentionQuery}%,username.ilike.%${mentionQuery}%`)
        .limit(5);
      setMentionResults(data ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [mentionQuery]);

  const handleTextChange = (value: string) => {
    setText(value);
    // Check for @mention
    const lastAt = value.lastIndexOf("@");
    if (lastAt >= 0) {
      const afterAt = value.slice(lastAt + 1);
      if (!afterAt.includes(" ") && afterAt.length > 0) {
        setMentionQuery(afterAt);
        return;
      }
    }
    setMentionQuery(null);
  };

  const insertMention = (profile: { display_name: string; username: string | null }) => {
    const handle = profile.username || profile.display_name;
    const lastAt = text.lastIndexOf("@");
    const newText = text.slice(0, lastAt) + `@${handle} `;
    setText(newText);
    setMentionQuery(null);
    setMentionResults([]);
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!text.trim() || !user) return;

    const { data: inserted } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        parent_id: replyTarget?.id || null,
        content: text.trim(),
      })
      .select("id")
      .single();

    // Extract mentions and save
    if (inserted) {
      const mentionRegex = /@(\w+)/g;
      let match;
      const mentionedUsernames: string[] = [];
      while ((match = mentionRegex.exec(text)) !== null) {
        mentionedUsernames.push(match[1]);
      }
      if (mentionedUsernames.length > 0) {
        const { data: mentionedProfiles } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("username", mentionedUsernames);

        if (mentionedProfiles && mentionedProfiles.length > 0) {
          await supabase.from("comment_mentions").insert(
            mentionedProfiles.map((p) => ({
              comment_id: inserted.id,
              mentioned_user_id: p.user_id,
            }))
          );
        }
      }
    }

    setText("");
    setReplyTarget(null);
    await fetchComments();

    // Update count
    const { count } = await supabase
      .from("post_comments")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);
    onCommentCountChange?.(count ?? 0);
  };

  const renderContent = (content: string) => {
    // Highlight @mentions
    return content.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className="text-primary font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-2.5 ${isReply ? "ml-10 mt-2" : "mt-3"}`}>
      <Avatar className="w-8 h-8 shrink-0">
        {comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} />}
        <AvatarFallback className="bg-secondary text-xs">
          {comment.author.displayName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-semibold text-foreground mr-1.5">
            {comment.author.displayName}
          </span>
          <span className="text-foreground">{renderContent(comment.content)}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-muted-foreground text-xs">{timeAgo(comment.createdAt)}</span>
          <button
            onClick={() => {
              setReplyTarget({ id: comment.id, name: comment.author.displayName });
              inputRef.current?.focus();
            }}
            className="text-muted-foreground text-xs font-medium hover:text-foreground"
          >
            Responder
          </button>
        </div>
        {comment.replies.map((r) => renderComment(r, true))}
      </div>
    </div>
  );

  return (
    <BottomSheet open={open} title="Comentários" onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Comments list */}
        <div className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          ) : (
            comments.map((c) => renderComment(c))
          )}
        </div>

        {/* Mention suggestions */}
        {mentionResults.length > 0 && (
          <div className="border-t border-border bg-card">
            {mentionResults.map((p) => (
              <button
                key={p.user_id}
                onClick={() => insertMention(p)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/50"
              >
                <span className="font-medium">{p.display_name}</span>
                {p.username && <span className="text-muted-foreground text-xs">@{p.username}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Reply indicator */}
        {replyTarget && (
          <div className="flex items-center gap-2 px-1 py-1.5 border-t border-border">
            <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Respondendo a <span className="font-medium text-foreground">{replyTarget.name}</span>
            </span>
            <button onClick={() => setReplyTarget(null)} className="ml-auto">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Adicionar comentário..."
            className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default CommentsSheet;
