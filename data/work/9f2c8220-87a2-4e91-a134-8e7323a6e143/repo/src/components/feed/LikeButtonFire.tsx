import { useState } from "react";
import { Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonFireProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
}

const LikeButtonFire = ({ liked, count, onToggle }: LikeButtonFireProps) => {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    if (!liked) setAnimate(true);
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 group"
      aria-label={liked ? "Descurtir" : "Curtir"}
    >
      <span className="relative">
        <motion.span
          animate={animate ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => setAnimate(false)}
          className="block"
        >
          <Flame
            className={`w-6 h-6 transition-colors ${
              liked
                ? "text-accent fill-accent"
                : "text-muted-foreground group-hover:text-accent/70"
            }`}
          />
        </motion.span>
        <AnimatePresence>
          {animate && (
            <motion.span
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Flame className="w-6 h-6 text-accent" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span
        className={`text-sm font-medium tabular-nums ${
          liked ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {count > 0 ? count : ""}
      </span>
    </button>
  );
};

export default LikeButtonFire;
