import { useWorld, WorldTheme } from "@/contexts/WorldContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, Sparkles, Volume2, VolumeX, Palette, Wind, MousePointer2, Layers, Sun, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

const themes: { id: WorldTheme; name: string; colors: string[] }[] = [
  { id: "warm-dreamy", name: "Warm Dreamy", colors: ["#F5E6D3", "#E8D4B8", "#D4C4A8"] },
  { id: "violet-mist", name: "Violet Mist", colors: ["#E8E0F0", "#D8C8E8", "#C8B8D8"] },
  { id: "haunted-manor", name: "Haunted Manor", colors: ["#1a0d1f", "#2d1525", "#4a1a1a"] },
  { id: "nightside-lake", name: "Nightside Lake", colors: ["#1a2a3a", "#0d1a2a", "#05101a"] },
];

export const WorldSettings = () => {
  const { settings, updateSettings, playSound } = useWorld();

  const handleThemeChange = (theme: WorldTheme) => {
    updateSettings({ theme });
    playSound("brush");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <Settings className="h-5 w-5 relative z-10" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card/95 backdrop-blur-xl border-border/50">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            World Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-8 mt-8">
          {/* Theme Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="h-4 w-4" />
              Atmosphere Theme
            </div>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative p-3 rounded-xl border-2 transition-all ${
                    settings.theme === theme.id
                      ? "border-accent shadow-lg"
                      : "border-border/50 hover:border-border"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex gap-1 mb-2">
                    {theme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-border/30"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium">{theme.name}</span>
                  {settings.theme === theme.id && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Particles Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              <span className="text-sm font-medium">Floating Particles</span>
            </div>
            <Switch
              checked={settings.particlesEnabled}
              onCheckedChange={(checked) => {
                updateSettings({ particlesEnabled: checked });
                playSound("rustle");
              }}
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">Ambient Sounds</span>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => {
                updateSettings({ soundEnabled: checked });
                if (checked) {
                  // Play a test sound when enabling
                  setTimeout(() => playSound("brush"), 100);
                }
              }}
            />
          </div>

          {/* Personality Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Personality Mode</span>
            </div>
            <Switch
              checked={settings.personalityMode}
              onCheckedChange={(checked) => {
                updateSettings({ personalityMode: checked });
                playSound("splash");
              }}
            />
          </div>

          {/* Cursor Effects Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-4 w-4" />
              <span className="text-sm font-medium">Cursor Effects</span>
            </div>
            <Switch
              checked={settings.cursorEffectsEnabled}
              onCheckedChange={(checked) => {
                updateSettings({ cursorEffectsEnabled: checked });
                playSound("brush");
              }}
            />
          </div>

          {/* Shader Background Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              <span className="text-sm font-medium">Shader Background</span>
            </div>
            <Switch
              checked={settings.shaderBackgroundEnabled}
              onCheckedChange={(checked) => {
                updateSettings({ shaderBackgroundEnabled: checked });
                playSound("brush");
              }}
            />
          </div>

          {/* Shader Intensity Slider */}
          {settings.shaderBackgroundEnabled && (
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Shader Intensity</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(settings.shaderIntensity * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.shaderIntensity * 100]}
                onValueChange={([value]) => {
                  updateSettings({ shaderIntensity: value / 100 });
                }}
                max={100}
                min={20}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* Parallax Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="text-sm font-medium">Parallax Layers</span>
            </div>
            <Switch
              checked={settings.parallaxEnabled}
              onCheckedChange={(checked) => {
                updateSettings({ parallaxEnabled: checked });
                playSound("rustle");
              }}
            />
          </div>

          {/* Mouse Glow Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span className="text-sm font-medium">Cursor Glow</span>
            </div>
            <Switch
              checked={settings.mouseGlowEnabled}
              onCheckedChange={(checked) => {
                updateSettings({ mouseGlowEnabled: checked });
                playSound("splash");
              }}
            />
          </div>

          {/* Grain Intensity Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Film Grain Intensity</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(settings.grainIntensity * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.grainIntensity * 100]}
              onValueChange={([value]) => {
                updateSettings({ grainIntensity: value / 100 });
              }}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
