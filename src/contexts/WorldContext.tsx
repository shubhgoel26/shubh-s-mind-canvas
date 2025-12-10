import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type WorldTheme = "warm-dreamy" | "violet-mist" | "sepia-memory" | "nightside-lake";

interface WorldSettings {
  theme: WorldTheme;
  particlesEnabled: boolean;
  soundEnabled: boolean;
  personalityMode: boolean;
  grainIntensity: number;
  cursorEffectsEnabled: boolean;
  shaderBackgroundEnabled: boolean;
  shaderIntensity: number;
  parallaxEnabled: boolean;
  mouseGlowEnabled: boolean;
}

interface WorldContextType {
  settings: WorldSettings;
  updateSettings: (updates: Partial<WorldSettings>) => void;
  playSound: (sound: "rustle" | "brush" | "splash") => void;
}

const SETTINGS_KEY = "shubh_world_settings";

const defaultSettings: WorldSettings = {
  theme: "warm-dreamy",
  particlesEnabled: true,
  soundEnabled: false,
  personalityMode: true,
  grainIntensity: 0.03,
  cursorEffectsEnabled: true,
  shaderBackgroundEnabled: true,
  shaderIntensity: 0.8,
  parallaxEnabled: true,
  mouseGlowEnabled: true,
};

const WorldContext = createContext<WorldContextType | null>(null);

export const useWorld = () => {
  const context = useContext(WorldContext);
  if (!context) throw new Error("useWorld must be used within WorldProvider");
  return context;
};

export const WorldProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<WorldSettings>(defaultSettings);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (e) {
        console.error("Failed to load world settings:", e);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<WorldSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const playSound = (sound: "rustle" | "brush" | "splash") => {
    if (!settings.soundEnabled) return;
    
    // Create subtle audio feedback using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds for different actions
    switch (sound) {
      case "rustle":
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        break;
      case "brush":
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.015, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        break;
      case "splash":
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.025, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        break;
    }
    
    oscillator.type = "sine";
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return (
    <WorldContext.Provider value={{ settings, updateSettings, playSound }}>
      {children}
    </WorldContext.Provider>
  );
};
