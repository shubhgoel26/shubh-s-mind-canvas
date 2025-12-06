import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface InkSplashProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

export const InkSplash = ({ x, y, onComplete }: InkSplashProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ left: x - 60, top: y - 60 }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <motion.circle
              cx="60"
              cy="60"
              r="40"
              fill="hsl(var(--accent) / 0.3)"
              initial={{ r: 0 }}
              animate={{ r: 50 }}
              transition={{ duration: 0.4 }}
            />
            <motion.circle
              cx="60"
              cy="60"
              r="25"
              fill="hsl(var(--accent) / 0.2)"
              initial={{ r: 0 }}
              animate={{ r: 35 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
            {/* Ink splatter drops */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.circle
                key={i}
                cx={60 + Math.cos((angle * Math.PI) / 180) * 30}
                cy={60 + Math.sin((angle * Math.PI) / 180) * 30}
                r="5"
                fill="hsl(var(--accent) / 0.4)"
                initial={{ r: 0, opacity: 1 }}
                animate={{
                  r: 8,
                  opacity: 0,
                  x: Math.cos((angle * Math.PI) / 180) * 20,
                  y: Math.sin((angle * Math.PI) / 180) * 20,
                }}
                transition={{ duration: 0.4, delay: i * 0.02 }}
              />
            ))}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
