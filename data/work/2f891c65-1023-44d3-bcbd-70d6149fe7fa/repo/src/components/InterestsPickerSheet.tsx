import { useState, useEffect } from "react";
import BottomSheet from "./BottomSheet";

interface InterestsPickerSheetProps {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onConfirm: (interests: string[]) => void;
}

const interestOptions = [
  "Casal", "Casal (2 mulheres)", "Casal (2 homens)",
  "Homem", "Homem Trans", "Mulher", "Mulher Trans",
  "Travesti", "Cross-dressing (CD)",
];

const InterestsPickerSheet = ({ open, onClose, selected, onConfirm }: InterestsPickerSheetProps) => {
  const [draft, setDraft] = useState<string[]>(selected);

  useEffect(() => {
    if (open) setDraft([...selected]);
  }, [open, selected]);

  const toggle = (interest: string) => {
    setDraft((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Interesses" onConfirm={() => { onConfirm(draft); onClose(); }}>
      <div className="grid grid-cols-3 gap-2">
        {interestOptions.map((interest) => {
          const isSelected = draft.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggle(interest)}
              className={`px-2 py-2.5 rounded-lg text-xs font-medium transition-colors text-center ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};

export default InterestsPickerSheet;
