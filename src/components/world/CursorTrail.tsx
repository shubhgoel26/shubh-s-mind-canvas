import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorld } from "@/contexts/WorldContext";

interface TrailDot {
  id: string;
  x: number;
  y: number;
}

const MAX_TRAIL_DOTS = 15;

export const CursorTrail = () => {
  const { settings } = useWorld();
  const [dots, setDots] = useState<TrailDot[]>([]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!settings.cursorEffectsEnabled) return;

    const newDot: TrailDot = {
      id: `trail-${Date.now()}-${Math.random()}`,
      x: e.clientX,
      y: e.clientY,
    };

    setDots((prev) => {
      const updated = [...prev, newDot];
      if (updated.length > MAX_TRAIL_DOTS) {
        return updated.slice(-MAX_TRAIL_DOTS);
      }
      return updated;
    });

    // Remove dot after animation
    setTimeout(() => {
      setDots((prev) => prev.filter((d) => d.id !== newDot.id));
    }, 400);
  }, [settings.cursorEffectsEnabled]);

  useEffect(() => {
    if (!settings.cursorEffectsEnabled) {
      setDots([]);
      return;
    }

    // Throttle mouse events
    let lastTime = 0;
    const throttleMs = 50;

    const throttledHandler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime >= throttleMs) {
        lastTime = now;
        handleMouseMove(e);
      }
    };

    window.addEventListener("mousemove", throttledHandler);
    return () => window.removeEventListener("mousemove", throttledHandler);
  }, [handleMouseMove, settings.cursorEffectsEnabled]);

  if (!settings.cursorEffectsEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            initial={{ 
              opacity: 0.6, 
              scale: 1,
              x: dot.x - 4,
              y: dot.y - 4,
            }}
            animate={{ 
              opacity: 0, 
              scale: 0.3,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--accent) / 0.6), transparent)",
              filter: "blur(1px)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
