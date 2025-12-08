import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PaintedTagProps {
  tag: string;
  isSelected: boolean;
  onClick: () => void;
  index?: number;
}

export const PaintedTag = ({ tag, isSelected, onClick, index = 0 }: PaintedTagProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 400, damping: 25 }}
      whileHover={{ 
        scale: 1.08, 
        boxShadow: "0 0 20px hsl(var(--accent) / 0.4)",
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 overflow-hidden",
        isSelected
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-secondary/60 text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      {/* Painted texture overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`paint-${tag}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="currentColor"
          filter={`url(#paint-${tag})`}
          opacity="0.1"
        />
      </svg>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 rounded-full"
        initial={{ opacity: 0, x: "-100%" }}
        whileHover={{ opacity: 1, x: "100%" }}
        transition={{ duration: 0.5 }}
      />

      <span className="relative z-10">{tag}</span>
    </motion.button>
  );
};
