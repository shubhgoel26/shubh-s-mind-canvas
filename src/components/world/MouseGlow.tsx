import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useWorld, WorldTheme } from "@/contexts/WorldContext";

interface DustParticle {
  id: number;
  offsetX: number;
  offsetY: number;
  size: number;
  delay: number;
}

const themeGlowColors: Record<WorldTheme, { glow: string; dust: string }> = {
  "warm-dreamy": {
    glow: "hsl(35 60% 75% / 0.25)",
    dust: "hsl(35 70% 80%)",
  },
  "violet-mist": {
    glow: "hsl(270 50% 75% / 0.25)",
    dust: "hsl(280 60% 80%)",
  },
  "haunted-manor": {
    glow: "hsl(0 70% 35% / 0.3)",
    dust: "hsl(0 80% 50%)",
  },
  "nightside-lake": {
    glow: "hsl(200 70% 50% / 0.2)",
    dust: "hsl(200 80% 60%)",
  },
};

const generateDustParticles = (count: number): DustParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    offsetX: (Math.random() - 0.5) * 200,
    offsetY: (Math.random() - 0.5) * 200,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 2,
  }));
};

export const MouseGlow = () => {
  const { settings } = useWorld();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dustParticles = useRef(generateDustParticles(12)).current;
  const colors = themeGlowColors[settings.theme];

  // Smooth spring for liquid glow effect
  const springConfig = { stiffness: 80, damping: 25, mass: 0.8 };
  const glowX = useSpring(0, springConfig);
  const glowY = useSpring(0, springConfig);

  // Even slower spring for outer glow
  const outerSpringConfig = { stiffness: 40, damping: 20, mass: 1.2 };
  const outerGlowX = useSpring(0, outerSpringConfig);
  const outerGlowY = useSpring(0, outerSpringConfig);

  useEffect(() => {
    if (!settings.mouseGlowEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      glowX.set(e.clientX);
      glowY.set(e.clientY);
      outerGlowX.set(e.clientX);
      outerGlowY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [settings.mouseGlowEnabled, glowX, glowY, outerGlowX, outerGlowY]);

  if (!settings.mouseGlowEnabled) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Outer soft glow - slowest */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          x: outerGlowX,
          y: outerGlowY,
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: "blur(40px)",
          willChange: "transform",
        }}
      />

      {/* Inner glow - medium speed */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          x: glowX,
          y: glowY,
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 60%)`,
          filter: "blur(20px)",
          willChange: "transform",
        }}
      />

      {/* Bright core */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          x: glowX,
          y: glowY,
          width: 100,
          height: 100,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: "blur(10px)",
          willChange: "transform",
        }}
      />

      {/* Interactive neon dust particles */}
      {dustParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            background: colors.dust,
            filter: "blur(1px)",
            boxShadow: `0 0 ${particle.size * 2}px ${colors.dust}`,
          }}
          animate={{
            x: mousePos.x + particle.offsetX + Math.sin(Date.now() / 1000 + particle.delay) * 20,
            y: mousePos.y + particle.offsetY + Math.cos(Date.now() / 1000 + particle.delay) * 20,
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            x: { type: "spring", stiffness: 100, damping: 15 },
            y: { type: "spring", stiffness: 100, damping: 15 },
            opacity: { duration: 2 + particle.delay, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 2 + particle.delay, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
};
