import { useWorld, WorldTheme } from "@/contexts/WorldContext";
import { FloatingParticles } from "./FloatingParticles";
import { motion } from "framer-motion";

const themeGradients: Record<WorldTheme, string> = {
  "warm-dreamy": "radial-gradient(ellipse at 30% 20%, hsl(35 45% 92% / 0.8) 0%, hsl(38 33% 97%) 50%, hsl(30 25% 90%) 100%)",
  "violet-mist": "radial-gradient(ellipse at 70% 30%, hsl(270 30% 88% / 0.7) 0%, hsl(260 20% 94%) 40%, hsl(280 15% 90%) 100%)",
  "sepia-memory": "radial-gradient(ellipse at 50% 50%, hsl(35 50% 88% / 0.9) 0%, hsl(28 35% 85%) 50%, hsl(25 30% 82%) 100%)",
  "nightside-lake": "radial-gradient(ellipse at 40% 60%, hsl(210 40% 20% / 0.95) 0%, hsl(220 35% 15%) 50%, hsl(230 30% 12%) 100%)",
};

const themeVignettes: Record<WorldTheme, string> = {
  "warm-dreamy": "radial-gradient(ellipse at center, transparent 40%, hsl(35 30% 70% / 0.15) 100%)",
  "violet-mist": "radial-gradient(ellipse at center, transparent 40%, hsl(270 20% 60% / 0.2) 100%)",
  "sepia-memory": "radial-gradient(ellipse at center, transparent 35%, hsl(28 40% 50% / 0.2) 100%)",
  "nightside-lake": "radial-gradient(ellipse at center, transparent 30%, hsl(220 40% 5% / 0.5) 100%)",
};

const themeColors: Record<WorldTheme, { particle: string; glow: string }> = {
  "warm-dreamy": { particle: "hsl(35 60% 70%)", glow: "hsl(35 50% 80%)" },
  "violet-mist": { particle: "hsl(270 40% 75%)", glow: "hsl(280 30% 80%)" },
  "sepia-memory": { particle: "hsl(30 50% 65%)", glow: "hsl(35 45% 75%)" },
  "nightside-lake": { particle: "hsl(200 50% 50%)", glow: "hsl(210 40% 40%)" },
};

export const WorldLayer = () => {
  const { settings } = useWorld();
  const { theme, particlesEnabled, grainIntensity } = settings;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient background */}
      <motion.div
        key={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
        style={{ background: themeGradients[theme] }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
        style={{
          background: themeColors[theme].glow,
          top: "10%",
          left: "20%",
        }}
        animate={{
          x: [0, 50, 0, -30, 0],
          y: [0, 30, -20, 10, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
        style={{
          background: themeColors[theme].particle,
          bottom: "20%",
          right: "15%",
        }}
        animate={{
          x: [0, -40, 20, -10, 0],
          y: [0, -20, 30, -15, 0],
          scale: [1, 0.9, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{ background: themeVignettes[theme] }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: grainIntensity,
          mixBlendMode: "overlay",
        }}
      />

      {/* Floating particles */}
      {particlesEnabled && (
        <FloatingParticles color={themeColors[theme].particle} />
      )}

      {/* Soft corner brush textures */}
      <div
        className="absolute top-0 left-0 w-64 h-64 opacity-10"
        style={{
          background: `radial-gradient(ellipse at top left, ${themeColors[theme].particle} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-48 h-48 opacity-8"
        style={{
          background: `radial-gradient(ellipse at bottom right, ${themeColors[theme].glow} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};
