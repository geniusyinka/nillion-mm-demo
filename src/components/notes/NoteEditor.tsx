import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLogContext } from "@/context/LogContext";
import { useCreateNoteMutation } from "@/hooks/notes/useCreateNoteMutation";
import { useUpdateNoteMutation } from "@/hooks/notes/useUpdateNoteMutation";
import type { Note } from "@/hooks/notes/useNotes";

interface NoteEditorProps {
  note: Note | null;
  onSave: () => void;
}

export function NoteEditor({ note, onSave }: NoteEditorProps) {
  const { log } = useLogContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const createNoteMutation = useCreateNoteMutation();
  const updateNoteMutation = useUpdateNoteMutation();

  // Update form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      // Extract content from encrypted format
      const noteContent = typeof note.content === "object" && "%allot" in note.content ? note.content["%allot"] : "";
      setContent(noteContent);
      setHasChanges(false);
    } else {
      setTitle("");
      setContent("");
      setHasChanges(false);
    }
  }, [note]);

  // Track changes
  useEffect(() => {
    if (note) {
      const noteContent = typeof note.content === "object" && "%allot" in note.content ? note.content["%allot"] : "";
      const titleChanged = title !== note.title;
      const contentChanged = content !== noteContent;
      setHasChanges(titleChanged || contentChanged);
    } else {
      setHasChanges(title.trim() !== "" || content.trim() !== "");
    }
  }, [title, content, note]);

  const handleSave = async () => {
    if (!title.trim()) {
      log("❌ Note title is required");
      return;
    }

    if (note) {
      // Update existing note
      log("Updating note...", { noteId: note._id });
      updateNoteMutation.mutate(
        {
          id: note._id,
          title: title.trim(),
          content: content.trim(),
        },
        {
          onSuccess: () => {
            log("✅ Note updated");
            setHasChanges(false);
            onSave();
          },
          onError: (err) => log("❌ Failed to update note", err.message),
        },
      );
    } else {
      // Create new note
      log("Creating note...");
      createNoteMutation.mutate(
        {
          title: title.trim(),
          content: content.trim(),
        },
        {
          onSuccess: () => {
            log("✅ Note created");
            setTitle("");
            setContent("");
            setHasChanges(false);
            onSave();
          },
          onError: (err) => log("❌ Failed to create note", err.message),
        },
      );
    }
  };

  const handleRevert = () => {
    if (note) {
      setTitle(note.title);
      const noteContent = typeof note.content === "object" && "%allot" in note.content ? note.content["%allot"] : "";
      setContent(noteContent);
    } else {
      setTitle("");
      setContent("");
    }
    setHasChanges(false);
  };

  const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-grow flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="note-title" className="text-sm font-medium text-heading-secondary">
            Title
          </label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-button-bg border border-border p-3 text-foreground"
            placeholder="Enter note title"
            disabled={isSaving}
          />
        </div>
        <div className="flex flex-col gap-2 flex-grow min-h-0">
          <label htmlFor="note-content" className="text-sm font-medium text-heading-secondary">
            Content
          </label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-grow bg-button-bg border border-border p-3 text-foreground resize-none"
            placeholder="Enter note content"
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="flex-shrink-0 flex gap-3 justify-end">
        {hasChanges && (
          <Button onClick={handleRevert} disabled={isSaving} className="w-auto px-6">
            Revert
          </Button>
        )}
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="w-auto px-6">
          {isSaving ? "Saving..." : note ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}







