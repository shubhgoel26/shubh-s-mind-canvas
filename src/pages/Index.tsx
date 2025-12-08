import { useState, useEffect, useCallback } from "react";
import { StickyNote, Note, NoteColor, NoteType } from "@/components/StickyNote";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { BoardSidebar } from "@/components/BoardSidebar";
import { WorldLayer } from "@/components/world/WorldLayer";
import { PersonalityEffects } from "@/components/world/PersonalityEffects";
import { InkSplash } from "@/components/world/InkSplash";
import { CursorTrail } from "@/components/world/CursorTrail";
import { useToast } from "@/hooks/use-toast";
import { useWorld } from "@/contexts/WorldContext";
import { AnimatePresence } from "framer-motion";

const STORAGE_KEY = "shubh_board_state";

interface SplashEffect {
  id: string;
  x: number;
  y: number;
}

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [splashEffects, setSplashEffects] = useState<SplashEffect[]>([]);
  const { toast } = useToast();
  const { playSound } = useWorld();

  // Load notes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setNotes(data.notes || []);
      } catch (error) {
        console.error("Failed to load board state:", error);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes }));
    }
  }, [notes]);

  const addSplashEffect = useCallback((x: number, y: number) => {
    const id = `splash-${Date.now()}`;
    setSplashEffects((prev) => [...prev, { id, x, y }]);
  }, []);

  const removeSplashEffect = useCallback((id: string) => {
    setSplashEffects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const createNote = useCallback(
    (type: NoteType, title: string, color: NoteColor, tags: string[]) => {
      const x = Math.random() * (window.innerWidth - 400) + 100;
      const y = Math.random() * (window.innerHeight - 400) + 100;
      
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        content: [""],
        tags,
        x,
        y,
        color,
        width: 280,
        height: 320,
      };
      
      addSplashEffect(x + 140, y + 160);
      playSound("splash");
      
      setNotes((prev) => [...prev, newNote]);
      toast({
        title: "Note created!",
        description: `"${title}" has been added to your board.`,
      });
    },
    [toast, addSplashEffect, playSound]
  );

  const updateNote = useCallback((updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      playSound("brush");
      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast({
        title: "Note deleted",
        variant: "destructive",
      });
    },
    [toast, playSound]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - 140;
        const y = e.clientY - rect.top - 160;

        addSplashEffect(e.clientX - rect.left, e.clientY - rect.top);
        playSound("splash");

        const newNote: Note = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "blank",
          title: "Quick Note",
          content: [""],
          tags: [],
          x,
          y,
          color: "sand",
          width: 280,
          height: 320,
        };
        setNotes((prev) => [...prev, newNote]);
        toast({
          title: "Quick note created!",
          description: "Double-click anywhere to add more notes.",
        });
      }
    },
    [toast, addSplashEffect, playSound]
  );

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleImport = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.notes && Array.isArray(parsed.notes)) {
        setNotes(parsed.notes);
        toast({
          title: "Board imported!",
          description: `Loaded ${parsed.notes.length} notes.`,
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid file format.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Get all unique tags from notes
  const availableTags = Array.from(
    new Set(notes.flatMap((note) => note.tags))
  ).sort();

  // Filter notes based on search and tags
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.some((item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => note.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <BoardSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onCreateNote={() => setIsCreateDialogOpen(true)}
        availableTags={availableTags}
        onImport={handleImport}
      />

      <div
        className="flex-1 relative overflow-hidden"
        onDoubleClick={handleDoubleClick}
      >
        {/* World aesthetic layers */}
        <WorldLayer />
        <PersonalityEffects />
        <CursorTrail />

        {/* Ink splash effects */}
        <AnimatePresence>
          {splashEffects.map((splash) => (
            <InkSplash
              key={splash.id}
              x={splash.x}
              y={splash.y}
              onComplete={() => removeSplashEffect(splash.id)}
            />
          ))}
        </AnimatePresence>

        {/* Content layer */}
        <div className="relative z-10 h-full">
          {filteredNotes.length === 0 && notes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-4 animate-fade-in">
                <h2 className="text-3xl font-semibold text-foreground/80">
                  Welcome to Your World
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Click <span className="font-medium">+ Add Note</span> or{" "}
                  <span className="font-medium">double-click anywhere</span> to
                  create your first sticky note.
                </p>
              </div>
            </div>
          )}

          {filteredNotes.length === 0 && notes.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-2 animate-fade-in">
                <p className="text-xl text-foreground/60">No matching notes</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <StickyNote
                key={note.id}
                note={note}
                onUpdate={updateNote}
                onDelete={deleteNote}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <CreateNoteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={createNote}
      />
    </div>
  );
};

export default Index;
