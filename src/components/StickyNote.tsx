import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, animate, Reorder } from "framer-motion";
import { Trash2, GripVertical, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type NoteColor = "beige" | "tan" | "olive" | "brown" | "sand";
export type NoteType = "ideas" | "todo" | "opinions" | "must-dos" | "blank";

export interface NoteBullet {
  id: string;
  text: string;
}

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: NoteBullet[];
  tags: string[];
  x: number;
  y: number;
  color: NoteColor;
  width: number;
  height: number;
}

interface StickyNoteProps {
  note: Note;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
}

const noteTypeLabels: Record<NoteType, string> = {
  ideas: "💡 Ideas",
  todo: "✓ To-Do",
  opinions: "💭 Opinions",
  "must-dos": "⚡ Must Do",
  blank: "📝 Note",
};

const colorClasses: Record<NoteColor, string> = {
  beige: "bg-note-beige border-note-beige/30",
  tan: "bg-note-tan border-note-tan/30",
  olive: "bg-note-olive border-note-olive/30",
  brown: "bg-note-brown border-note-brown/30",
  sand: "bg-note-sand border-note-sand/30",
};

// Helper to create a new bullet
const createBullet = (text: string = ""): NoteBullet => ({
  id: `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  text,
});

interface BulletItemProps {
  item: NoteBullet;
  canRemove: boolean;
  onChange: (id: string, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, id: string) => void;
  onRemove: (id: string) => void;
  pendingDeleteId: string | null;
  onPendingDelete: (id: string | null) => void;
}

const BulletItemComponent = ({ item, canRemove, onChange, onKeyDown, onRemove, pendingDeleteId, onPendingDelete }: BulletItemProps) => {
  const isPendingDelete = pendingDeleteId === item.id;

  const handleDeleteClick = () => {
    if (isPendingDelete) {
      onRemove(item.id);
      onPendingDelete(null);
    } else {
      onPendingDelete(item.id);
      // Auto-reset after 2 seconds
      setTimeout(() => {
        onPendingDelete(null);
      }, 2000);
    }
  };

  return (
    <Reorder.Item value={item} id={item.id} className="list-none">
      <div className="flex items-center gap-2 group">
        <GripVertical className="w-3 h-3 text-foreground/40 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-foreground/60 text-sm">•</span>
        <Input
          value={item.text}
          onChange={(e) => onChange(item.id, e.target.value)}
          onKeyDown={(e) => onKeyDown(e, item.id)}
          placeholder="Add item..."
          className="text-sm bg-background/30 border-0 focus:bg-background/50 transition-colors h-8"
        />
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-all ${
              isPendingDelete 
                ? "opacity-100 bg-destructive/30 text-destructive animate-pulse" 
                : "hover:bg-destructive/20 hover:text-destructive"
            }`}
            title={isPendingDelete ? "Click again to delete" : "Double-click to delete"}
          >
            <Minus className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Reorder.Item>
  );
};

export const StickyNote = ({ note, onUpdate, onDelete }: StickyNoteProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [pendingDeleteBulletId, setPendingDeleteBulletId] = useState<string | null>(null);
  
  const lastDragTime = useRef(Date.now());
  const lastDragPos = useRef({ x: 0, y: 0 });
  const wiggleRotation = useMotionValue(0);
  
  const handleDragVelocity = (x: number, y: number) => {
    const now = Date.now();
    const timeDelta = now - lastDragTime.current;
    const distance = Math.sqrt(
      Math.pow(x - lastDragPos.current.x, 2) + 
      Math.pow(y - lastDragPos.current.y, 2)
    );
    const velocity = distance / Math.max(timeDelta, 1);
    
    if (velocity > 2 && !isWiggling) {
      setIsWiggling(true);
      animate(wiggleRotation, [0, -5, 5, -3, 3, 0], {
        duration: 0.4,
        ease: "easeInOut",
        onComplete: () => setIsWiggling(false),
      });
    }
    
    lastDragTime.current = now;
    lastDragPos.current = { x, y };
  };

  const handleAddBullet = () => {
    onUpdate({
      ...note,
      content: [...note.content, createBullet()],
    });
  };

  const handleBulletChange = (bulletId: string, value: string) => {
    const newContent = note.content.map((b) =>
      b.id === bulletId ? { ...b, text: value } : b
    );
    onUpdate({ ...note, content: newContent });
  };

  const handleBulletKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    bulletId: string
  ) => {
    const bulletIndex = note.content.findIndex((b) => b.id === bulletId);
    if (bulletIndex === -1) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newContent = [...note.content];
      newContent.splice(bulletIndex + 1, 0, createBullet());
      onUpdate({ ...note, content: newContent });
    } else if (
      e.key === "Backspace" &&
      note.content[bulletIndex].text === "" &&
      note.content.length > 1
    ) {
      e.preventDefault();
      const newContent = note.content.filter((b) => b.id !== bulletId);
      onUpdate({ ...note, content: newContent });
    }
  };

  const handleRemoveBullet = (bulletId: string) => {
    if (note.content.length > 1) {
      const newContent = note.content.filter((b) => b.id !== bulletId);
      onUpdate({ ...note, content: newContent });
    }
  };

  const handleReorderBullets = (newOrder: NoteBullet[]) => {
    onUpdate({ ...note, content: newOrder });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(note.id), 400);
  };

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => {
            setIsDragging(true);
            lastDragTime.current = Date.now();
          }}
          onDrag={(_, info) => {
            handleDragVelocity(info.point.x, info.point.y);
          }}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            onUpdate({
              ...note,
              x: note.x + info.offset.x,
              y: note.y + info.offset.y,
            });
          }}
          style={{
            x: note.x,
            y: note.y,
            width: note.width,
            minHeight: note.height,
            rotate: isWiggling ? wiggleRotation : undefined,
          }}
          className="absolute cursor-move pointer-events-auto"
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            rotate: isDragging ? Math.random() * 4 - 2 : 0,
          }}
          exit={{ 
            scale: 0, 
            opacity: 0,
            filter: "blur(10px)",
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 20px 40px -15px rgba(0,0,0,0.2)",
          }}
          whileDrag={{
            scale: 1.05,
            rotate: Math.random() * 6 - 3,
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.3)",
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            rotate: { duration: 0.1 },
          }}
        >
          <div
            className={`${colorClasses[note.color]} border-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-4 h-full backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-3 gap-2">
              <GripVertical className="w-4 h-4 text-foreground/40 flex-shrink-0 mt-1" />
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={note.title}
                    onChange={(e) => onUpdate({ ...note, title: e.target.value })}
                    onBlur={() => setIsEditing(false)}
                    className="font-medium text-base bg-background/50 border-foreground/20"
                    autoFocus
                  />
                ) : (
                  <h3
                    className="font-medium text-base cursor-text"
                    onClick={() => setIsEditing(true)}
                  >
                    {note.title || "Untitled"}
                  </h3>
                )}
                <span className="text-xs text-foreground/60 mt-1 block">
                  {noteTypeLabels[note.type]}
                </span>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <Reorder.Group
              axis="y"
              values={note.content}
              onReorder={handleReorderBullets}
              className="space-y-2 mb-3"
            >
              {note.content.map((bullet) => (
                <BulletItemComponent
                  key={bullet.id}
                  item={bullet}
                  canRemove={note.content.length > 1}
                  onChange={handleBulletChange}
                  onKeyDown={handleBulletKeyDown}
                  onRemove={handleRemoveBullet}
                  pendingDeleteId={pendingDeleteBulletId}
                  onPendingDelete={setPendingDeleteBulletId}
                />
              ))}
            </Reorder.Group>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddBullet}
              className="w-full h-8 text-xs hover:bg-background/50"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add item
            </Button>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {note.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-0 h-5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export the helper for use in Index.tsx
export { createBullet };
