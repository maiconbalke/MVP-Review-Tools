import { UserProfile } from "@/hooks/useUserProfile";

export interface ProfileCompletion {
  completed: number;
  total: 4;
  missing: string[];
}

const REQUIREMENTS: { key: string; label: string; check: (p: UserProfile) => boolean }[] = [
  { key: "avatarUrl", label: "foto", check: (p) => !!p.avatarUrl },
  { key: "gender", label: "gênero", check: (p) => !!p.gender?.trim() },
  { key: "interests", label: "interesses", check: (p) => p.interests.length > 0 },
  { key: "location", label: "localização", check: (p) => !!p.location?.trim() },
];

export function getProfileCompletion(profile: UserProfile): ProfileCompletion {
  const missing: string[] = [];
  let completed = 0;
  for (const req of REQUIREMENTS) {
    if (req.check(profile)) {
      completed++;
    } else {
      missing.push(req.label);
    }
  }
  return { completed, total: 4, missing };
}

export function isProfileComplete(profile: UserProfile): boolean {
  return REQUIREMENTS.every((r) => r.check(profile));
}

/** Returns current onboarding step: 1=foto, 2=gênero, 3=interesses, 4=localização, 5=completo */
export function getOnboardingStep(profile: UserProfile): 1 | 2 | 3 | 4 | 5 {
  if (!profile.avatarUrl) return 1;
  if (!profile.gender?.trim()) return 2;
  if (profile.interests.length === 0) return 3;
  if (!profile.location?.trim()) return 4;
  return 5;
}
