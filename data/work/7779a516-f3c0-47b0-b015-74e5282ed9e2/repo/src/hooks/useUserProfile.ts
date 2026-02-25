import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface UserProfile {
  userId: string;
  avatarUrl?: string;
  gender?: string;
  username: string;
  interests: string[];
  birthDate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
}

function loadInterests(userId: string): string[] {
  try {
    const stored = localStorage.getItem(`pp:interests:${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function fetchProfile(userId: string, email: string): Promise<UserProfile> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const interests = loadInterests(userId);

  if (data) {
    return {
      userId,
      avatarUrl: data.avatar_url || undefined,
      gender: data.profile_type,
      username: data.display_name,
      interests,
      location: data.location_label || undefined,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      bio: data.bio || undefined,
    };
  }

  return {
    userId,
    username: email.split("@")[0] || "",
    interests,
  };
}

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: () => fetchProfile(user!.id, user!.email ?? ""),
    enabled: !!user,
    staleTime: 30_000,
  });

  const defaultProfile: UserProfile = {
    userId: user?.id || "",
    username: "",
    interests: [],
  };

  const updateProfile = useCallback(
    async (partial: Partial<UserProfile>) => {
      if (!user) return;

      // Optimistic update
      queryClient.setQueryData<UserProfile>(
        ["userProfile", user.id],
        (old) => ({ ...(old || defaultProfile), ...partial })
      );

      // Save interests to localStorage
      if (partial.interests !== undefined) {
        localStorage.setItem(
          `pp:interests:${user.id}`,
          JSON.stringify(partial.interests ?? [])
        );
      }

      // Save DB fields to Supabase
      const dbUpdate: Record<string, unknown> = {};
      if (partial.username !== undefined) dbUpdate.display_name = partial.username;
      if (partial.gender !== undefined) dbUpdate.profile_type = partial.gender;
      if (partial.avatarUrl !== undefined) dbUpdate.avatar_url = partial.avatarUrl || null;
      if (partial.bio !== undefined) dbUpdate.bio = partial.bio || null;
      if (partial.location !== undefined) dbUpdate.location_label = partial.location || null;
      if ("latitude" in partial) dbUpdate.latitude = partial.latitude ?? null;
      if ("longitude" in partial) dbUpdate.longitude = partial.longitude ?? null;

      if (Object.keys(dbUpdate).length > 0) {
        await supabase
          .from("profiles")
          .update(dbUpdate as any)
          .eq("user_id", user.id);
      }
    },
    [user, queryClient]
  );

  return {
    profile: profile || defaultProfile,
    updateProfile,
    loading: isLoading,
  };
}
