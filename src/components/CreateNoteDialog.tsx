import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NoteType, NoteColor } from "./StickyNote";
import { Lightbulb, CheckSquare, MessageCircle, Zap, StickyNote } from "lucide-react";

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    type: NoteType,
    title: string,
    color: NoteColor,
    tags: string[]
  ) => void;
}

const noteTemplates: {
  type: NoteType;
  icon: React.ReactNode;
  label: string;
  color: NoteColor;
  placeholder: string;
}[] = [
  {
    type: "ideas",
    icon: <Lightbulb className="w-5 h-5" />,
    label: "Ideas",
    color: "beige",
    placeholder: "New concept or thought...",
  },
  {
    type: "todo",
    icon: <CheckSquare className="w-5 h-5" />,
    label: "To-Do List",
    color: "tan",
    placeholder: "Tasks to complete...",
  },
  {
    type: "opinions",
    icon: <MessageCircle className="w-5 h-5" />,
    label: "Opinions",
    color: "olive",
    placeholder: "My take on...",
  },
  {
    type: "must-dos",
    icon: <Zap className="w-5 h-5" />,
    label: "Must Dos",
    color: "brown",
    placeholder: "Priority items...",
  },
  {
    type: "blank",
    icon: <StickyNote className="w-5 h-5" />,
    label: "Blank",
    color: "sand",
    placeholder: "Start typing...",
  },
];

const allTags = ["life", "startup", "gym", "music", "learning", "work", "personal"];

export const CreateNoteDialog = ({
  open,
  onOpenChange,
  onCreate,
}: CreateNoteDialogProps) => {
  const [selectedType, setSelectedType] = useState<NoteType>("blank");
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<NoteColor>("sand");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate(selectedType, title, selectedColor, selectedTags);
    setTitle("");
    setSelectedType("blank");
    setSelectedColor("sand");
    setSelectedTags([]);
    onOpenChange(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="text-sm mb-3 block">Choose Template</Label>
            <div className="grid grid-cols-3 gap-3">
              {noteTemplates.map((template) => (
                <Button
                  key={template.type}
                  variant={selectedType === template.type ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    setSelectedType(template.type);
                    setSelectedColor(template.color);
                  }}
                >
                  {template.icon}
                  <span className="text-xs">{template.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-sm">
              Note Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                noteTemplates.find((t) => t.type === selectedType)?.placeholder
              }
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>

          <div>
            <Label className="text-sm mb-3 block">Color</Label>
            <div className="flex gap-2">
              {(["beige", "tan", "olive", "brown", "sand"] as NoteColor[]).map(
                (color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg bg-note-${color} border-2 transition-all hover:scale-110 ${
                      selectedColor === color
                        ? "border-foreground ring-2 ring-foreground/20"
                        : "border-border"
                    }`}
                  />
                )
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm mb-3 block">Tags (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="flex-1"
          >
            Create Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
