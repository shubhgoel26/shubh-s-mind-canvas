import { Search, Plus, Settings, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface BoardSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onCreateNote: () => void;
  availableTags: string[];
}

export const BoardSidebar = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  onCreateNote,
  availableTags,
}: BoardSidebarProps) => {
  return (
    <div className="w-72 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-semibold mb-1">Shubh's World</h1>
        <p className="text-sm text-muted-foreground">Personal aesthetic board</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div>
            <Button
              onClick={onCreateNote}
              className="w-full h-12 text-base shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Note
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Find notes..."
              className="bg-background/50"
            />
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-3 block">
              <Tag className="w-4 h-4 inline mr-2" />
              Filter by Tags
            </label>
            {availableTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tags yet. Add tags when creating notes.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const data = localStorage.getItem("shubh_board_state");
                if (data) {
                  const blob = new Blob([data], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `shubh-board-${Date.now()}.json`;
                  a.click();
                }
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Export Board
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
