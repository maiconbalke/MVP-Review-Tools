import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, Search, Settings, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isProfileComplete } from "@/features/profile/profileCompletion";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { ROUTES } from "@/routes";
import AppLayout from "@/components/AppLayout";
import FeedLayer from "@/components/FeedLayer";
import FeedHeaderTop from "@/components/feed/FeedHeaderTop";
import SearchLayer from "@/components/SearchLayer";
import SettingsLayer from "@/components/SettingsLayer";
import CreatePostSheet from "@/components/feed/CreatePostSheet";

type Layer = "feed" | "search" | "settings";

const AppPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile, updateProfile, loading: profileLoading } = useUserProfile();
  const navHidden = useHideOnScroll();

  const profileComplete = isProfileComplete(profile);
  const [activeLayer, setActiveLayer] = useState<Layer>(profileComplete ? "feed" : "settings");
  const [forceEditOpen, setForceEditOpen] = useState(!profileComplete);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate(ROUTES.LOGIN);
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profileComplete) {
      setForceEditOpen(false);
      setActiveLayer("feed");
    }
  }, [profileComplete]);

  const handleLayerChange = useCallback((layer: Layer) => {
    if ((layer === "feed" || layer === "search") && !profileComplete) return;
    setActiveLayer(layer);
  }, [profileComplete]);

  const openEditProfile = useCallback(() => {
    setActiveLayer("settings");
    setForceEditOpen(true);
  }, []);

  if (loading || profileLoading) return null;

  const navItems: { key: Layer | "publish"; icon: React.ReactNode; label: string }[] = [
    { key: "feed", icon: <Newspaper className="w-5 h-5" />, label: "Feed" },
    { key: "search", icon: <Search className="w-5 h-5" />, label: "Buscar" },
    { key: "publish", icon: <Plus className="w-5 h-5" />, label: "Publicar" },
    { key: "settings", icon: <Settings className="w-5 h-5" />, label: "Config" },
  ];

  const renderHeader = () => {
    switch (activeLayer) {
      case "feed":
        return (
          <FeedHeaderTop
            onInteractionsClick={() => {/* TODO */}}
            onMessagesClick={() => {/* TODO */}}
          />
        );
      case "search":
        return (
          <div className="bg-card border-b border-border px-4 py-3 shrink-0 sticky top-0 z-30">
            <div className="mx-auto w-full max-w-[600px]">
              <h1 className="text-lg font-serif text-foreground">Buscar</h1>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="bg-card border-b border-border px-4 py-3 shrink-0 sticky top-0 z-30">
            <div className="mx-auto w-full max-w-[600px]">
              <h1 className="text-lg font-serif text-foreground">Configurações</h1>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeLayer) {
      case "feed":
        return <FeedLayer profileComplete={profileComplete} onCompleteProfile={openEditProfile} />;
      case "search":
        return <SearchLayer />;
      case "settings":
        return (
          <SettingsLayer
            forceEditOpen={forceEditOpen}
            onForceEditClose={() => setForceEditOpen(false)}
          />
        );
    }
  };

  return (
    <AppLayout>
      {renderHeader()}

      <div className="flex-1">{renderContent()}</div>

      {/* Bottom Nav */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 h-16 bg-card/95 backdrop-blur-sm border-t border-border transition-transform duration-200 ease-out ${
          navHidden ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto w-full max-w-[600px] h-full flex">
          {navItems.map((item) => {
            const isPublish = item.key === "publish";
            const disabled = !isPublish && (item.key === "feed" || item.key === "search") && !profileComplete;

            if (isPublish) {
              return (
                <button
                  key="publish"
                  onClick={() => profileComplete && setCreatePostOpen(true)}
                  disabled={!profileComplete}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                    !profileComplete
                      ? "opacity-50 cursor-not-allowed text-muted-foreground"
                      : "text-primary hover:text-primary/80"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary-foreground" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => handleLayerChange(item.key as Layer)}
                disabled={disabled}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  disabled
                    ? "opacity-50 cursor-not-allowed text-muted-foreground"
                    : activeLayer === item.key
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <CreatePostSheet
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={() => {
          // Refresh feed
          setActiveLayer("feed");
        }}
      />
    </AppLayout>
  );
};

export default AppPage;
