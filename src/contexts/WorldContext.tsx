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
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Helper to create noise
    const createNoise = (duration: number) => {
      const bufferSize = audioContext.sampleRate * duration;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      return noise;
    };
    
    // Helper to create filtered noise (for more organic sounds)
    const createFilteredNoise = (duration: number, frequency: number, Q: number, type: BiquadFilterType = "lowpass") => {
      const noise = createNoise(duration);
      const filter = audioContext.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = frequency;
      filter.Q.value = Q;
      noise.connect(filter);
      return { noise, filter };
    };
    
    switch (sound) {
      case "rustle": {
        // Paper rustle - filtered noise with envelope
        const { noise, filter } = createFilteredNoise(0.15, 3000, 1, "bandpass");
        const gain = audioContext.createGain();
        
        filter.connect(gain);
        gain.connect(audioContext.destination);
        
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        
        // Add a second layer with different frequency
        const { noise: noise2, filter: filter2 } = createFilteredNoise(0.12, 5000, 2, "bandpass");
        const gain2 = audioContext.createGain();
        filter2.connect(gain2);
        gain2.connect(audioContext.destination);
        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        noise.start(audioContext.currentTime);
        noise.stop(audioContext.currentTime + 0.15);
        noise2.start(audioContext.currentTime + 0.01);
        noise2.stop(audioContext.currentTime + 0.12);
        break;
      }
      
      case "brush": {
        // Soft brush stroke - sweeping filtered noise
        const { noise, filter } = createFilteredNoise(0.25, 800, 0.5, "lowpass");
        const gain = audioContext.createGain();
        
        filter.connect(gain);
        gain.connect(audioContext.destination);
        
        // Sweep the filter frequency for brush effect
        filter.frequency.setValueAtTime(400, audioContext.currentTime);
        filter.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        filter.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.25);
        
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.03);
        gain.gain.setValueAtTime(0.06, audioContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
        
        noise.start(audioContext.currentTime);
        noise.stop(audioContext.currentTime + 0.25);
        break;
      }
      
      case "splash": {
        // Thunder-like splash with sub-bass rumble
        const { noise: thunderNoise, filter: thunderFilter } = createFilteredNoise(0.8, 150, 2, "lowpass");
        const thunderGain = audioContext.createGain();
        
        thunderFilter.connect(thunderGain);
        thunderGain.connect(audioContext.destination);
        
        // Sub-bass oscillator for rumble
        const subBass = audioContext.createOscillator();
        subBass.type = "sine";
        subBass.frequency.setValueAtTime(40, audioContext.currentTime);
        subBass.frequency.exponentialRampToValueAtTime(25, audioContext.currentTime + 0.6);
        
        const subGain = audioContext.createGain();
        subBass.connect(subGain);
        subGain.connect(audioContext.destination);
        
        // Thunder envelope
        thunderGain.gain.setValueAtTime(0, audioContext.currentTime);
        thunderGain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
        thunderGain.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.15);
        thunderGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        
        // Sub-bass envelope
        subGain.gain.setValueAtTime(0, audioContext.currentTime);
        subGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.03);
        subGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
        
        // High frequency crack
        const { noise: crackNoise, filter: crackFilter } = createFilteredNoise(0.05, 4000, 3, "highpass");
        const crackGain = audioContext.createGain();
        crackFilter.connect(crackGain);
        crackGain.connect(audioContext.destination);
        crackGain.gain.setValueAtTime(0.08, audioContext.currentTime);
        crackGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        thunderNoise.start(audioContext.currentTime);
        thunderNoise.stop(audioContext.currentTime + 0.8);
        subBass.start(audioContext.currentTime);
        subBass.stop(audioContext.currentTime + 0.6);
        crackNoise.start(audioContext.currentTime);
        crackNoise.stop(audioContext.currentTime + 0.05);
        break;
      }
    }
  };

  return (
    <WorldContext.Provider value={{ settings, updateSettings, playSound }}>
      {children}
    </WorldContext.Provider>
  );
};
