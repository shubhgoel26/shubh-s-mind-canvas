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

const themeTabStyles: Record<WorldTheme, { 
  container: string;
  active: string; 
  inactive: string; 
  text: string;
  addButton: string;
}> = {
  "warm-dreamy": {
    container: "bg-[hsl(35_40%_95%/0.9)] border-t border-[hsl(35_30%_80%/0.5)]",
    active: "bg-[hsl(35_50%_88%)] border-b-2 border-[hsl(35_50%_65%)] shadow-sm",
    inactive: "bg-transparent hover:bg-[hsl(35_40%_92%)] border-b-2 border-transparent",
    text: "text-[hsl(35_30%_25%)]",
    addButton: "text-[hsl(35_40%_40%)] hover:bg-[hsl(35_40%_90%)]",
  },
  "beach-paradise": {
    container: "bg-[hsl(197_60%_95%/0.9)] border-t border-[hsl(174_50%_70%/0.5)]",
    active: "bg-[hsl(197_70%_88%)] border-b-2 border-[hsl(174_72%_45%)] shadow-sm",
    inactive: "bg-transparent hover:bg-[hsl(197_60%_92%)] border-b-2 border-transparent",
    text: "text-[hsl(197_60%_20%)]",
    addButton: "text-[hsl(174_60%_35%)] hover:bg-[hsl(197_60%_90%)]",
  },
  "haunted-manor": {
    container: "bg-[hsl(270_20%_10%/0.95)] border-t border-[hsl(270_15%_25%/0.6)]",
    active: "bg-[hsl(270_20%_18%)] border-b-2 border-[hsl(0_60%_40%)] shadow-[0_0_10px_hsl(0_60%_30%/0.3)]",
    inactive: "bg-transparent hover:bg-[hsl(270_18%_14%)] border-b-2 border-transparent",
    text: "text-[hsl(270_10%_80%)]",
    addButton: "text-[hsl(0_50%_60%)] hover:bg-[hsl(270_18%_15%)]",
  },
  "nightside-lake": {
    container: "bg-[hsl(220_35%_14%/0.95)] border-t border-[hsl(220_30%_30%/0.6)]",
    active: "bg-[hsl(220_40%_22%)] border-b-2 border-[hsl(200_60%_50%)] shadow-[0_0_10px_hsl(200_60%_40%/0.3)]",
    inactive: "bg-transparent hover:bg-[hsl(220_35%_18%)] border-b-2 border-transparent",
    text: "text-[hsl(210_30%_88%)]",
    addButton: "text-[hsl(200_60%_60%)] hover:bg-[hsl(220_35%_18%)]",
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
    <div className={`relative z-20 pointer-events-auto backdrop-blur-sm ${themeStyle.container}`}>
      <div className="flex items-center gap-0.5 px-3 py-1.5 overflow-x-auto scrollbar-thin">
        <Reorder.Group
          axis="x"
          values={pages}
          onReorder={onPagesReorder}
          className="flex items-center gap-0.5"
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className={`
                    group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer text-sm font-medium
                    transition-all duration-200
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
                  <FileText className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                  
                  {editingPageId === page.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        ref={inputRef}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleConfirmRename}
                        className="h-5 w-24 text-xs px-1.5 py-0 bg-background/50 border-border/50"
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
                      <span className="max-w-[100px] truncate">{page.name}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 hover:bg-background/30"
                          onClick={(e) => handleStartRename(page, e)}
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </Button>
                        {pages.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 hover:bg-destructive/20 hover:text-destructive"
                            onClick={(e) => handleDelete(page.id, e)}
                          >
                            <X className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
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
            className={`h-7 w-7 ml-1 rounded-lg ${themeStyle.addButton}`}
            onClick={() => {
              onPageAdd();
              playSound("splash");
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
