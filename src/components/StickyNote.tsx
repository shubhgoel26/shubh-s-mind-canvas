import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Trash2, GripVertical, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type NoteColor = "beige" | "tan" | "olive" | "brown" | "sand";
export type NoteType = "ideas" | "todo" | "opinions" | "must-dos" | "blank";

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string[];
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

export const StickyNote = ({ note, onUpdate, onDelete }: StickyNoteProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  
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
    
    // Trigger wiggle if velocity exceeds threshold
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
      content: [...note.content, ""],
    });
    setEditingIndex(note.content.length);
  };

  const handleBulletChange = (index: number, value: string) => {
    const newContent = [...note.content];
    newContent[index] = value;
    onUpdate({ ...note, content: newContent });
  };

  const handleBulletKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newContent = [...note.content];
      newContent.splice(index + 1, 0, "");
      onUpdate({ ...note, content: newContent });
      setEditingIndex(index + 1);
    } else if (
      e.key === "Backspace" &&
      note.content[index] === "" &&
      note.content.length > 1
    ) {
      e.preventDefault();
      const newContent = note.content.filter((_, i) => i !== index);
      onUpdate({ ...note, content: newContent });
      setEditingIndex(Math.max(0, index - 1));
    }
  };

  const handleRemoveBullet = (index: number) => {
    if (note.content.length > 1) {
      const newContent = note.content.filter((_, i) => i !== index);
      onUpdate({ ...note, content: newContent });
    }
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

        <div className="space-y-2 mb-3">
          {note.content.map((bullet, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <span className="text-foreground/60 text-sm">•</span>
              <Input
                value={bullet}
                onChange={(e) => handleBulletChange(index, e.target.value)}
                onKeyDown={(e) => handleBulletKeyDown(e, index)}
                onFocus={() => setEditingIndex(index)}
                onBlur={() => setEditingIndex(null)}
                placeholder="Add item..."
                className="text-sm bg-background/30 border-0 focus:bg-background/50 transition-colors h-8"
              />
              {note.content.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBullet(index)}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                >
                  <Minus className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

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
