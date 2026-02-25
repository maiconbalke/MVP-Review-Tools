import { useEffect, useRef, useCallback } from "react";
import { X, Check } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  children: React.ReactNode;
}

const BottomSheet = ({
  open,
  title,
  onClose,
  onConfirm,
  confirmLabel = "Salvar",
  children,
}: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 mx-auto max-w-[600px] rounded-t-2xl bg-card border-t border-border max-h-[85dvh] md:max-h-[812px] flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center"
          >
            <X className="w-5 h-5 text-destructive-foreground" />
          </button>
          {title && (
            <h2 className="text-foreground font-serif text-base font-semibold">{title}</h2>
          )}
          {onConfirm ? (
            <button
              onClick={onConfirm}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-primary-foreground" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
