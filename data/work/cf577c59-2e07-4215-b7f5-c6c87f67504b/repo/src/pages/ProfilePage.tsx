import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { toast } from "@/hooks/use-toast";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileConnectionButton from "@/components/profile/ProfileConnectionButton";
import ProfileAboutSection from "@/components/profile/ProfileAboutSection";
import ProfileInterestSection from "@/components/profile/ProfileInterestSection";
import ProfileLocationSection from "@/components/profile/ProfileLocationSection";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileGrid from "@/components/profile/ProfileGrid";

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  profile_type: string;
  location_label: string | null;
}

const TABS = [
  { key: "posts", label: "Publicações" },
  { key: "about", label: "Sobre" },
];

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile: localProfile } = useUserProfile();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [menuOpen, setMenuOpen] = useState(false);
  const [posts, setPosts] = useState<{ id: string; imageUrl: string }[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const { isBlocked, blockUser } = useBlockedUsers();

  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = isOwnProfile ? user?.id : userId;

  const {
    state: connectionState,
    loading: connectionLoading,
    requestConnection,
    acceptConnection,
    rejectConnection,
  } = useConnectionStatus(isOwnProfile ? undefined : targetUserId);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, bio, avatar_url, cover_url, profile_type, location_label")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (!error && data) {
        setProfileData(data as ProfileData);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [targetUserId]);

  // Fetch user's posts for grid
  useEffect(() => {
    const fetchPosts = async () => {
      if (!targetUserId) return;

      const { data: userPosts } = await supabase
        .from("posts")
        .select("id, image_url")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (!userPosts || userPosts.length === 0) {
        setPosts([]);
        return;
      }

      // Fetch post_media for cover images (position=0)
      const postIds = userPosts.map((p) => p.id);
      const { data: media } = await supabase
        .from("post_media")
        .select("post_id, media_url")
        .in("post_id", postIds)
        .eq("position", 0);

      const mediaMap = new Map((media ?? []).map((m) => [m.post_id, m.media_url]));

      const mapped = userPosts
        .map((p) => ({
          id: p.id,
          imageUrl: mediaMap.get(p.id) || p.image_url || "",
        }))
        .filter((p) => p.imageUrl);

      setPosts(mapped);
    };
    fetchPosts();
  }, [targetUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = isOwnProfile
    ? localProfile.username || profileData?.display_name || "Usuário"
    : profileData?.display_name || "Usuário";
  const avatarUrl = isOwnProfile
    ? localProfile.avatarUrl || profileData?.avatar_url
    : profileData?.avatar_url;
  const bio = isOwnProfile ? localProfile.bio || profileData?.bio : profileData?.bio;
  const profileType = profileData?.profile_type || "homem";
  const coverUrl = profileData?.cover_url;
  const interests = isOwnProfile ? localProfile.interests : [];
  const location = isOwnProfile
    ? localProfile.location || profileData?.location_label
    : profileData?.location_label;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="text-foreground p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
          {displayName}
        </span>
        <div className="relative">
          <button onClick={() => !isOwnProfile && setMenuOpen(!menuOpen)} className="text-foreground p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {menuOpen && !isOwnProfile && targetUserId && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
              <button
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-secondary/50 w-full text-left"
                onClick={async () => {
                  setMenuOpen(false);
                  await blockUser(targetUserId);
                  toast({ title: "Perfil bloqueado" });
                  navigate(-1);
                }}
              >
                <Ban className="w-4 h-4" />
                {isBlocked(targetUserId) ? "Já bloqueado" : "Bloquear perfil"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-[600px]">
        <ProfileHero
          coverUrl={coverUrl}
          avatarUrl={avatarUrl}
          displayName={displayName}
          isOnline={isOwnProfile}
        />

        {/* Name */}
        <div className="text-center mt-3 px-6">
          <h1 className="text-xl font-serif font-semibold text-foreground">{displayName}</h1>
        </div>

        <ProfileStats connectionsCount={0} photosCount={posts.length} reputationScore={0} />

        {!isOwnProfile && (
          <ProfileConnectionButton
            state={connectionState}
            loading={connectionLoading}
            onRequest={requestConnection}
            onAccept={acceptConnection}
            onReject={rejectConnection}
          />
        )}

        <div className="mt-4">
          <ProfileTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === "posts" && (
          <ProfileGrid
            items={posts}
            onItemClick={(item) => setLightboxUrl(item.imageUrl)}
          />
        )}

        {activeTab === "about" && (
          <div className="pb-8">
            <ProfileAboutSection bio={bio} profileType={profileType} />
            <ProfileInterestSection interests={interests} />
            <ProfileLocationSection location={location} />
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-full max-h-[80vh] rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
