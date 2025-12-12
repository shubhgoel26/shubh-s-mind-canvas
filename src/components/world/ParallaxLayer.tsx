import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useWorld, WorldTheme } from "@/contexts/WorldContext";

interface ParallaxElement {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  shape: "circle" | "blob" | "streak";
}

const themeParallaxColors: Record<WorldTheme, { shapes: string; fog: string; particles: string }> = {
  "warm-dreamy": {
    shapes: "hsl(35 50% 75% / 0.15)",
    fog: "hsl(35 40% 85% / 0.3)",
    particles: "hsl(35 60% 70% / 0.4)",
  },
  "violet-mist": {
    shapes: "hsl(270 40% 75% / 0.15)",
    fog: "hsl(270 30% 85% / 0.3)",
    particles: "hsl(280 50% 75% / 0.4)",
  },
  "haunted-manor": {
    shapes: "hsl(270 30% 15% / 0.3)",
    fog: "hsl(0 40% 20% / 0.4)",
    particles: "hsl(0 70% 40% / 0.5)",
  },
  "nightside-lake": {
    shapes: "hsl(210 50% 40% / 0.2)",
    fog: "hsl(220 40% 20% / 0.4)",
    particles: "hsl(200 60% 50% / 0.3)",
  },
};

const generateElements = (count: number): ParallaxElement[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 50 + Math.random() * 200,
    opacity: 0.3 + Math.random() * 0.4,
    rotation: Math.random() * 360,
    shape: ["circle", "blob", "streak"][Math.floor(Math.random() * 3)] as ParallaxElement["shape"],
  }));
};

const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 6,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 20,
  }));
};

export const ParallaxLayer = () => {
  const { settings } = useWorld();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  const shapes = useRef(generateElements(8)).current;
  const memoryParticles = useRef(generateParticles(20)).current;
  const colors = themeParallaxColors[settings.theme];

  // Smooth spring animations for parallax
  const springConfig = { stiffness: 50, damping: 30, mass: 1 };
  const mouseX = useSpring(0.5, springConfig);
  const mouseY = useSpring(0.5, springConfig);

  // Different parallax speeds for each layer
  const layer0X = useTransform(mouseX, [0, 1], [15, -15]);
  const layer0Y = useTransform(mouseY, [0, 1], [15, -15]);
  const layer1X = useTransform(mouseX, [0, 1], [30, -30]);
  const layer1Y = useTransform(mouseY, [0, 1], [30, -30]);
  const layer2X = useTransform(mouseX, [0, 1], [50, -50]);
  const layer2Y = useTransform(mouseY, [0, 1], [50, -50]);

  useEffect(() => {
    if (!settings.parallaxEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      mouseX.set(x);
      mouseY.set(y);
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [settings.parallaxEnabled, mouseX, mouseY]);

  if (!settings.parallaxEnabled) {
    return null;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 0: Deepest - Abstract shapes */}
      <motion.div
        className="absolute inset-0"
        style={{ x: layer0X, y: layer0Y, willChange: "transform" }}
      >
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: shape.size,
              height: shape.size,
              opacity: shape.opacity * 0.5,
              transform: `rotate(${shape.rotation}deg)`,
            }}
          >
            {shape.shape === "circle" && (
              <div
                className="w-full h-full rounded-full blur-2xl"
                style={{ background: colors.shapes }}
              />
            )}
            {shape.shape === "blob" && (
              <div
                className="w-full h-full blur-3xl"
                style={{
                  background: colors.shapes,
                  borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                }}
              />
            )}
            {shape.shape === "streak" && (
              <div
                className="w-full h-8 blur-2xl"
                style={{
                  background: `linear-gradient(90deg, transparent, ${colors.shapes}, transparent)`,
                }}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Layer 1: Mid - Fog/Mist */}
      <motion.div
        className="absolute inset-0"
        style={{ x: layer1X, y: layer1Y, willChange: "transform" }}
      >
        <div
          className="absolute inset-0 blur-3xl"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 30%, ${colors.fog}, transparent),
              radial-gradient(ellipse 60% 40% at 80% 70%, ${colors.fog}, transparent)
            `,
          }}
        />
        {/* Drifting fog patches */}
        <motion.div
          className="absolute w-[400px] h-[300px] blur-3xl"
          style={{
            left: "10%",
            top: "40%",
            background: colors.fog,
            borderRadius: "50%",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[300px] h-[200px] blur-3xl"
          style={{
            right: "20%",
            bottom: "30%",
            background: colors.fog,
            borderRadius: "50%",
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
        />
      </motion.div>

      {/* Layer 2: Front - Memory particles */}
      <motion.div
        className="absolute inset-0"
        style={{ x: layer2X, y: layer2Y, willChange: "transform" }}
      >
        {memoryParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: colors.particles,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
