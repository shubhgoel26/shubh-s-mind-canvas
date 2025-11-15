import { useState, useEffect, useCallback } from "react";
import { StickyNote, Note, NoteColor, NoteType } from "@/components/StickyNote";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { BoardSidebar } from "@/components/BoardSidebar";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "shubh_board_state";

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();

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

  const createNote = useCallback(
    (type: NoteType, title: string, color: NoteColor, tags: string[]) => {
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        content: [""],
        tags,
        x: Math.random() * (window.innerWidth - 400) + 100,
        y: Math.random() * (window.innerHeight - 400) + 100,
        color,
        width: 280,
        height: 320,
      };
      setNotes((prev) => [...prev, newNote]);
      toast({
        title: "Note created!",
        description: `"${title}" has been added to your board.`,
      });
    },
    [toast]
  );

  const updateNote = useCallback((updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast({
        title: "Note deleted",
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - 140;
        const y = e.clientY - rect.top - 160;

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
    [toast]
  );

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

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
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <BoardSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onCreateNote={() => setIsCreateDialogOpen(true)}
        availableTags={availableTags}
      />

      <div
        className="flex-1 relative grain-texture overflow-hidden"
        onDoubleClick={handleDoubleClick}
      >
        {filteredNotes.length === 0 && notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-4 animate-fade-in">
              <h2 className="text-3xl font-semibold text-foreground/80">
                Welcome to Your Board
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

        {filteredNotes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        ))}
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
