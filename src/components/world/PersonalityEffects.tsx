import { motion, AnimatePresence } from "framer-motion";
import { useWorld } from "@/contexts/WorldContext";
import { useState, useEffect } from "react";

type MoodEffect = "rain" | "sunlight" | "fog" | "none";

export const PersonalityEffects = () => {
  const { settings } = useWorld();
  const [currentMood, setCurrentMood] = useState<MoodEffect>("none");
  const [isIdle, setIsIdle] = useState(false);

  // Idle detection
  useEffect(() => {
    if (!settings.personalityMode) return;

    let idleTimer: NodeJS.Timeout;
    
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsIdle(true), 30000);
    };

    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    
    idleTimer = setTimeout(() => setIsIdle(true), 30000);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
    };
  }, [settings.personalityMode]);

  // Random mood changes
  useEffect(() => {
    if (!settings.personalityMode) {
      setCurrentMood("none");
      return;
    }

    const moodInterval = setInterval(() => {
      const moods: MoodEffect[] = ["rain", "sunlight", "fog", "none", "none", "none"];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setCurrentMood(randomMood);
      
      // Clear mood after a while
      setTimeout(() => setCurrentMood("none"), 15000);
    }, 60000);

    return () => clearInterval(moodInterval);
  }, [settings.personalityMode]);

  if (!settings.personalityMode) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Idle flicker effect */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            className="absolute inset-0 bg-foreground/5"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.03, 0, 0.02, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 5,
            }}
          />
        )}
      </AnimatePresence>

      {/* Rain effect */}
      <AnimatePresence>
        {currentMood === "rain" && (
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${Math.random() * 50 + 30}px`,
                }}
                initial={{ top: -50, opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 0.3, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: Math.random() * 1 + 1,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Sunlight streak effect */}
      <AnimatePresence>
        {currentMood === "sunlight" && (
          <motion.div
            className="absolute top-0 right-1/4 w-96 h-full"
            style={{
              background: "linear-gradient(135deg, hsl(45 70% 70% / 0.1) 0%, transparent 50%)",
            }}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          />
        )}
      </AnimatePresence>

      {/* Fog/memory effect */}
      <AnimatePresence>
        {currentMood === "fog" && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, hsl(var(--background) / 0.5) 0%, transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.4, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
          />
        )}
      </AnimatePresence>

      {/* Idle floating brush strokes */}
      <AnimatePresence>
        {isIdle && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-32 h-2 rounded-full opacity-10"
                style={{
                  background: "hsl(var(--accent))",
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 20}%`,
                  transform: `rotate(${-15 + i * 15}deg)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.1, 0.05, 0.1, 0],
                  scale: [0.8, 1, 0.9, 1, 0.8],
                  x: [0, 20, -10, 15, 0],
                }}
                transition={{
                  duration: 8,
                  delay: i * 2,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
