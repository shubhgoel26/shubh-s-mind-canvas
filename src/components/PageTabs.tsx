import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, X, Edit2, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorld, WorldTheme } from "@/contexts/WorldContext";

export interface Page {
  id: string;
  name: string;
}

interface PageTabsProps {
  pages: Page[];
  activePageId: string;
  onPageSelect: (pageId: string) => void;
  onPageAdd: () => void;
  onPageRename: (pageId: string, newName: string) => void;
  onPageDelete: (pageId: string) => void;
  onPagesReorder: (pages: Page[]) => void;
}

const themeTabStyles: Record<WorldTheme, { active: string; inactive: string; border: string; text: string }> = {
  "warm-dreamy": {
    active: "bg-[hsl(35_50%_92%)] border-[hsl(35_40%_75%)]",
    inactive: "bg-[hsl(35_30%_96%/0.5)] hover:bg-[hsl(35_40%_94%)]",
    border: "border-[hsl(35_30%_80%/0.5)]",
    text: "text-foreground",
  },
  "violet-mist": {
    active: "bg-[hsl(270_40%_92%)] border-[hsl(270_35%_75%)]",
    inactive: "bg-[hsl(270_20%_96%/0.5)] hover:bg-[hsl(270_30%_94%)]",
    border: "border-[hsl(270_25%_80%/0.5)]",
    text: "text-foreground",
  },
  "haunted-manor": {
    active: "bg-[hsl(270_15%_18%)] border-[hsl(0_50%_35%)]",
    inactive: "bg-[hsl(270_15%_12%/0.6)] hover:bg-[hsl(270_15%_15%)]",
    border: "border-[hsl(270_15%_25%/0.5)]",
    text: "text-[hsl(270_10%_85%)]",
  },
  "nightside-lake": {
    active: "bg-[hsl(220_35%_18%)] border-[hsl(200_50%_45%)]",
    inactive: "bg-[hsl(220_30%_15%/0.6)] hover:bg-[hsl(220_32%_18%)]",
    border: "border-[hsl(220_30%_30%/0.5)]",
    text: "text-[hsl(210_30%_90%)]",
  },
};

export const PageTabs = ({
  pages,
  activePageId,
  onPageSelect,
  onPageAdd,
  onPageRename,
  onPageDelete,
  onPagesReorder,
}: PageTabsProps) => {
  const { settings, playSound } = useWorld();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const themeStyle = themeTabStyles[settings.theme];

  useEffect(() => {
    if (editingPageId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingPageId]);

  const handleStartRename = (page: Page, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPageId(page.id);
    setEditingName(page.name);
  };

  const handleConfirmRename = () => {
    if (editingPageId && editingName.trim()) {
      onPageRename(editingPageId, editingName.trim());
      playSound("brush");
    }
    setEditingPageId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirmRename();
    } else if (e.key === "Escape") {
      setEditingPageId(null);
      setEditingName("");
    }
  };

  const handleDelete = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length > 1) {
      onPageDelete(pageId);
      playSound("brush");
    }
  };

  return (
    <div className={`flex items-center gap-1 p-2 border-b ${themeStyle.border} overflow-x-auto`}>
      <Reorder.Group
        axis="x"
        values={pages}
        onReorder={onPagesReorder}
        className="flex items-center gap-1"
      >
        <AnimatePresence mode="popLayout">
          {pages.map((page) => (
            <Reorder.Item
              key={page.id}
              value={page}
              whileDrag={{ scale: 1.05, zIndex: 50 }}
              className="relative"
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer text-sm
                  border transition-colors
                  ${page.id === activePageId ? themeStyle.active : themeStyle.inactive}
                  ${themeStyle.text}
                `}
                onClick={() => {
                  if (editingPageId !== page.id) {
                    onPageSelect(page.id);
                    playSound("rustle");
                  }
                }}
              >
                <FileText className="w-3.5 h-3.5 opacity-60" />
                
                {editingPageId === page.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      ref={inputRef}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleConfirmRename}
                      className="h-5 w-20 text-xs px-1 py-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmRename();
                      }}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="max-w-[80px] truncate">{page.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e) => handleStartRename(page, e)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    {pages.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:text-destructive"
                        onClick={(e) => handleDelete(page.id, e)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </>
                )}
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
      
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="icon"
          variant="ghost"
          className={`h-7 w-7 ${themeStyle.text}`}
          onClick={() => {
            onPageAdd();
            playSound("splash");
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};
