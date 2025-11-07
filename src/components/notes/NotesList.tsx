import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { useLogContext } from "@/context/LogContext";
import { useDeleteNoteMutation } from "@/hooks/notes/useDeleteNoteMutation";
import { useNotes } from "@/hooks/notes/useNotes";
import { useMinimumLoadingTime } from "@/hooks/useMinimumLoadingTime";
import type { Note } from "@/hooks/notes/useNotes";

interface NotesListProps {
  selectedNoteId: string | null;
  onSelectNote: (note: Note | null) => void;
  onCreateNew: () => void;
}

export function NotesList({ selectedNoteId, onSelectNote, onCreateNew }: NotesListProps) {
  const { log } = useLogContext();
  const { data: notes, isLoading, isError, error } = useNotes();
  const showLoading = useMinimumLoadingTime(isLoading, 500);
  const deleteNoteMutation = useDeleteNoteMutation();

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      log("Deleting note...", { noteId });
      deleteNoteMutation.mutate(noteId, {
        onSuccess: () => {
          log("✅ Note deleted");
          if (selectedNoteId === noteId) {
            onSelectNote(null);
          }
        },
        onError: (err) => log("❌ Failed to delete note", err.message),
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (showLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 mb-4">
          <Button onClick={onCreateNew} className="w-full">
            + New Note
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <Loading message="Loading notes..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 mb-4">
          <Button onClick={onCreateNew} className="w-full">
            + New Note
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500">Error: {error?.message || "Failed to load notes"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4">
        <Button onClick={onCreateNew} className="w-full">
          + New Note
        </Button>
      </div>
      <div className="flex-grow overflow-auto">
        {!notes || notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-heading-secondary">
            <p className="mb-4">No notes yet</p>
            <Button onClick={onCreateNew} className="w-auto">
              Create your first note
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note._id}
                onClick={() => onSelectNote(note)}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedNoteId === note._id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-border bg-button-bg hover:bg-button-bg-hover"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-foreground truncate">{note.title || "Untitled"}</h3>
                    <p className="text-xs text-heading-secondary mt-1">
                      Updated {formatDate(note.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(note._id, e)}
                    disabled={deleteNoteMutation.isPending}
                    className="flex-shrink-0 text-red-400 hover:text-red-300 p-1"
                    title="Delete note"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}







