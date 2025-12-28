import { useState, useEffect, useCallback } from "react";
import { StickyNote, Note, NoteColor, NoteType, createBullet } from "@/components/StickyNote";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { BoardSidebar } from "@/components/BoardSidebar";
import { PageTabs, Page } from "@/components/PageTabs";
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

interface BoardState {
  pages: Page[];
  activePageId: string;
  notesByPage: Record<string, Note[]>;
}

const createDefaultPage = (): Page => ({
  id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: "Page 1",
});

const Index = () => {
  const [pages, setPages] = useState<Page[]>([createDefaultPage()]);
  const [activePageId, setActivePageId] = useState<string>("");
  const [notesByPage, setNotesByPage] = useState<Record<string, Note[]>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [splashEffects, setSplashEffects] = useState<SplashEffect[]>([]);
  const { toast } = useToast();
  const { playSound } = useWorld();

  // Initialize activePageId after pages are set
  useEffect(() => {
    if (pages.length > 0 && !activePageId) {
      setActivePageId(pages[0].id);
    }
  }, [pages, activePageId]);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        
        // Migration: handle old format (just notes array)
        if (data.notes && !data.pages) {
          const defaultPage = createDefaultPage();
          setPages([defaultPage]);
          setActivePageId(defaultPage.id);
          setNotesByPage({ [defaultPage.id]: data.notes });
        } else if (data.pages && data.notesByPage) {
          setPages(data.pages);
          setActivePageId(data.activePageId || data.pages[0]?.id || "");
          setNotesByPage(data.notesByPage);
        }
      } catch (error) {
        console.error("Failed to load board state:", error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (pages.length > 0 && activePageId) {
      const state: BoardState = {
        pages,
        activePageId,
        notesByPage,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [pages, activePageId, notesByPage]);

  // Get notes for current page
  const notes = notesByPage[activePageId] || [];

  const setNotes = useCallback((updater: Note[] | ((prev: Note[]) => Note[])) => {
    setNotesByPage((prev) => {
      const currentNotes = prev[activePageId] || [];
      const newNotes = typeof updater === "function" ? updater(currentNotes) : updater;
      return { ...prev, [activePageId]: newNotes };
    });
  }, [activePageId]);

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
        content: [createBullet()],
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
    [toast, addSplashEffect, playSound, setNotes]
  );

  const updateNote = useCallback((updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  }, [setNotes]);

  const deleteNote = useCallback(
    (id: string) => {
      playSound("brush");
      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast({
        title: "Note deleted",
        variant: "destructive",
      });
    },
    [toast, playSound, setNotes]
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
          content: [createBullet()],
          tags: [],
          x,
          y,
          color: "sand",
          width: 280,
          height: 320,
        };
        setNotes((prev) => [...prev, newNote]);
      }
    },
    [addSplashEffect, playSound, setNotes]
  );

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleImport = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      
      // Handle new format
      if (parsed.pages && parsed.notesByPage) {
        setPages(parsed.pages);
        setActivePageId(parsed.activePageId || parsed.pages[0]?.id);
        setNotesByPage(parsed.notesByPage);
        toast({
          title: "Board imported!",
          description: `Loaded ${parsed.pages.length} pages.`,
        });
      } 
      // Handle old format (just notes array)
      else if (parsed.notes && Array.isArray(parsed.notes)) {
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
  }, [toast, setNotes]);

  // Page management
  const handlePageAdd = useCallback(() => {
    const newPage: Page = {
      id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Page ${pages.length + 1}`,
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageId(newPage.id);
    setNotesByPage((prev) => ({ ...prev, [newPage.id]: [] }));
  }, [pages.length]);

  const handlePageRename = useCallback((pageId: string, newName: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === pageId ? { ...page, name: newName } : page))
    );
  }, []);

  const handlePageDelete = useCallback((pageId: string) => {
    if (pages.length <= 1) return;
    
    const pageIndex = pages.findIndex((p) => p.id === pageId);
    const newPages = pages.filter((p) => p.id !== pageId);
    
    // Switch to adjacent page
    if (activePageId === pageId) {
      const newIndex = Math.min(pageIndex, newPages.length - 1);
      setActivePageId(newPages[newIndex].id);
    }
    
    setPages(newPages);
    setNotesByPage((prev) => {
      const newState = { ...prev };
      delete newState[pageId];
      return newState;
    });
  }, [pages, activePageId]);

  const handlePagesReorder = useCallback((newPages: Page[]) => {
    setPages(newPages);
  }, []);

  // Get all unique tags from notes across all pages
  const availableTags = Array.from(
    new Set(
      Object.values(notesByPage)
        .flat()
        .flatMap((note) => note.tags)
    )
  ).sort();

  // Filter notes based on search and tags
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.some((item) =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
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

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          {/* Double-click capture layer - must be above world layers */}
          <div 
            className="absolute inset-0 z-[5]" 
            onDoubleClick={handleDoubleClick}
          />
          
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
          <div className="relative z-10 h-full pointer-events-none">
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

        {/* Page tabs at bottom */}
        <PageTabs
          pages={pages}
          activePageId={activePageId}
          onPageSelect={setActivePageId}
          onPageAdd={handlePageAdd}
          onPageRename={handlePageRename}
          onPageDelete={handlePageDelete}
          onPagesReorder={handlePagesReorder}
        />
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
