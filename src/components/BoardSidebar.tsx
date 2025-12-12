import { Search, Plus, Tag, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WorldSettings } from "@/components/world/WorldSettings";
import { PaintedTag } from "@/components/world/PaintedTag";
import { motion, AnimatePresence } from "framer-motion";
import { useWorld, WorldTheme } from "@/contexts/WorldContext";
import { useRef, useState } from "react";

const themeSidebarStyles: Record<WorldTheme, { bg: string; glow: string; border: string; accent: string; text?: string; mutedText?: string }> = {
  "warm-dreamy": {
    bg: "bg-[hsl(35_40%_97%/0.85)]",
    glow: "bg-[hsl(35_60%_70%/0.3)]",
    border: "border-[hsl(35_30%_80%/0.5)]",
    accent: "hsl(35 60% 70%)",
  },
  "violet-mist": {
    bg: "bg-[hsl(270_30%_96%/0.85)]",
    glow: "bg-[hsl(270_50%_75%/0.3)]",
    border: "border-[hsl(270_25%_80%/0.5)]",
    accent: "hsl(270 50% 75%)",
  },
  "sepia-memory": {
    bg: "bg-[hsl(30_35%_94%/0.85)]",
    glow: "bg-[hsl(30_50%_65%/0.3)]",
    border: "border-[hsl(30_30%_75%/0.5)]",
    accent: "hsl(30 50% 65%)",
  },
  "nightside-lake": {
    bg: "bg-[hsl(220_35%_12%/0.95)]",
    glow: "bg-[hsl(200_60%_50%/0.25)]",
    border: "border-[hsl(220_30%_35%/0.6)]",
    accent: "hsl(200 60% 50%)",
    text: "text-[hsl(210_30%_90%)]",
    mutedText: "text-[hsl(210_20%_70%)]",
  },
};

interface BoardSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onCreateNote: () => void;
  availableTags: string[];
  onImport?: (data: string) => void;
}

export const BoardSidebar = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  onCreateNote,
  availableTags,
  onImport,
}: BoardSidebarProps) => {
  const { playSound, settings } = useWorld();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [rippleButtons, setRippleButtons] = useState<{ [key: string]: { x: number; y: number } | null }>({});

  const themeStyle = themeSidebarStyles[settings.theme];
  const isNightTheme = settings.theme === "nightside-lake";

  const handleExport = () => {
    const data = localStorage.getItem("shubh_board_state");
    if (data) {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shubh-board-${Date.now()}.json`;
      a.click();
      playSound("rustle");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImport?.(content);
        playSound("splash");
      };
      reader.readAsText(file);
    }
  };

  const createRipple = (buttonId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRippleButtons({
      ...rippleButtons,
      [buttonId]: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    });
    setTimeout(() => {
      setRippleButtons((prev) => ({ ...prev, [buttonId]: null }));
    }, 600);
  };

  return (
    <motion.div 
      className={`w-72 ${themeStyle.bg} backdrop-blur-xl border-r ${themeStyle.border} h-screen flex flex-col relative overflow-hidden transition-colors duration-700`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Ambient glow effect - theme reactive */}
      <motion.div
        className={`absolute -top-20 -left-20 w-40 h-40 rounded-full ${themeStyle.glow} blur-3xl pointer-events-none transition-colors duration-700`}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary glow for night theme */}
      {isNightTheme && (
        <motion.div
          className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[hsl(200_70%_50%/0.15)] blur-3xl pointer-events-none"
          animate={{
            opacity: [0.2, 0.35, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      )}

      <div className="p-6 border-b border-border/50 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-semibold mb-1 ${themeStyle.text || ''}`}>Shubh's World</h1>
            <p className={`text-sm ${themeStyle.mutedText || 'text-muted-foreground'}`}>Personal aesthetic board</p>
          </div>
          <WorldSettings />
        </div>
      </div>

      <ScrollArea className="flex-1 relative z-10">
        <div className="p-6 space-y-6">
          <div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => {
                  onCreateNote();
                  playSound("splash");
                }}
                className="w-full h-12 text-base shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <Plus className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Add Note</span>
              </Button>
            </motion.div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium mb-2 flex items-center gap-2 ${themeStyle.text || ''}`}>
              <Search className="w-4 h-4" />
              Search
            </label>
            <motion.div
              className="relative"
              animate={!isSearchFocused && !searchQuery ? {
                scale: [1, 1.01, 1],
              } : {}}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Find notes..."
                className={`bg-background/50 border-border/50 focus:border-accent transition-all focus:shadow-md focus:ring-2 focus:ring-accent/20 ${isNightTheme ? 'bg-[hsl(220_30%_18%/0.8)] text-[hsl(210_30%_90%)] placeholder:text-[hsl(210_20%_60%)]' : ''}`}
                onFocus={() => {
                  setIsSearchFocused(true);
                  playSound("rustle");
                }}
                onBlur={() => setIsSearchFocused(false)}
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: searchQuery || isSearchFocused ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>

          <Separator className="bg-border/30" />

          <div>
            <label className={`text-sm font-medium mb-3 flex items-center gap-2 ${themeStyle.text || ''}`}>
              <Tag className="w-4 h-4" />
              Filter by Tags
            </label>
            {availableTags.length === 0 ? (
              <p className={`text-sm ${themeStyle.mutedText || 'text-muted-foreground'}`}>
                No tags yet. Add tags when creating notes.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {availableTags.map((tag, index) => (
                    <PaintedTag
                      key={tag}
                      tag={tag}
                      isSelected={selectedTags.includes(tag)}
                      index={index}
                      onClick={() => {
                        onTagToggle(tag);
                        playSound("brush");
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <Separator className="bg-border/30" />

          <div className="space-y-2">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="outline"
                className={`w-full justify-start bg-background/30 border-border/50 hover:bg-background/50 relative overflow-hidden ${isNightTheme ? 'bg-[hsl(220_30%_20%/0.6)] border-[hsl(200_40%_40%/0.4)] text-[hsl(210_30%_90%)] hover:bg-[hsl(220_30%_25%/0.7)]' : ''}`}
                onClick={(e) => {
                  createRipple("export", e);
                  handleExport();
                }}
              >
                {rippleButtons.export && (
                  <motion.span
                    className="absolute rounded-full bg-accent/30"
                    initial={{ width: 0, height: 0, opacity: 0.5 }}
                    animate={{ width: 200, height: 200, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      left: rippleButtons.export.x - 100,
                      top: rippleButtons.export.y - 100,
                    }}
                  />
                )}
                <Download className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">Export Board</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="outline"
                className={`w-full justify-start bg-background/30 border-border/50 hover:bg-background/50 relative overflow-hidden ${isNightTheme ? 'bg-[hsl(220_30%_20%/0.6)] border-[hsl(200_40%_40%/0.4)] text-[hsl(210_30%_90%)] hover:bg-[hsl(220_30%_25%/0.7)]' : ''}`}
                onClick={(e) => {
                  createRipple("import", e);
                  handleImportClick();
                }}
              >
                {rippleButtons.import && (
                  <motion.span
                    className="absolute rounded-full bg-accent/30"
                    initial={{ width: 0, height: 0, opacity: 0.5 }}
                    animate={{ width: 200, height: 200, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      left: rippleButtons.import.x - 100,
                      top: rippleButtons.import.y - 100,
                    }}
                  />
                )}
                <Upload className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">Import Board</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
