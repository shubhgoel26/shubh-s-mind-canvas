import { Search, Plus, Tag, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WorldSettings } from "@/components/world/WorldSettings";
import { motion } from "framer-motion";
import { useWorld } from "@/contexts/WorldContext";
import { useRef } from "react";

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
  const { playSound } = useWorld();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <motion.div 
      className="w-72 bg-card/80 backdrop-blur-xl border-r border-border/50 h-screen flex flex-col relative overflow-hidden"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Ambient glow effect */}
      <motion.div
        className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-accent/20 blur-3xl pointer-events-none"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="p-6 border-b border-border/50 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Shubh's World</h1>
            <p className="text-sm text-muted-foreground">Personal aesthetic board</p>
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
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </label>
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.01 }}
            >
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Find notes..."
                className="bg-background/50 border-border/50 focus:border-accent transition-all focus:shadow-md"
                onFocus={() => playSound("rustle")}
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: searchQuery ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>

          <Separator className="bg-border/30" />

          <div>
            <label className="text-sm font-medium mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Filter by Tags
            </label>
            {availableTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tags yet. Add tags when creating notes.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => {
                        onTagToggle(tag);
                        playSound("brush");
                      }}
                    >
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-border/30" />

          <div className="space-y-2">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="outline"
                className="w-full justify-start bg-background/30 border-border/50 hover:bg-background/50"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Board
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="outline"
                className="w-full justify-start bg-background/30 border-border/50 hover:bg-background/50"
                onClick={handleImportClick}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Board
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
