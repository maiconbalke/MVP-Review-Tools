import { Check } from "lucide-react";
import { getOnboardingStep } from "@/features/profile/profileCompletion";
import { UserProfile } from "@/hooks/useUserProfile";

const STEPS = [
  { num: 1, label: "Foto" },
  { num: 2, label: "Gênero" },
  { num: 3, label: "Interesses" },
  { num: 4, label: "Localização" },
];

interface OnboardingProgressProps {
  profile: UserProfile;
  className?: string;
}

const OnboardingProgress = ({ profile, className }: OnboardingProgressProps) => {
  const currentStep = getOnboardingStep(profile);

  // Don't render if complete
  if (currentStep === 5) return null;

  return (
    <div className={`bg-card rounded-xl p-4 border border-border ${className ?? "mx-4 mt-4"}`}>
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((step, i) => {
          const done = currentStep > step.num;
          const active = currentStep === step.num;
          return (
            <div key={step.num} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : step.num}
              </div>
              {/* Line */}
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-colors ${
                    done ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Passo {currentStep}: <span className="text-foreground font-medium">{STEPS[currentStep - 1]?.label}</span>
      </p>
    </div>
  );
};

export default OnboardingProgress;
