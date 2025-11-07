import { useState } from "react";
import { AppFooter } from "@/components/layouts/AppFooter";
import { AppHeader } from "@/components/layouts/AppHeader";
import { Loading } from "@/components/ui/Loading";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NotesList } from "@/components/notes/NotesList";
import { useCheckSubscriptionQuery } from "@/hooks/useCheckSubscriptionQuery";
import { useInitializeSessionMutation } from "@/hooks/useInitializeSessionMutation";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useNillion } from "@/hooks/useNillion";
import { useNotesCollection } from "@/hooks/notes/useNotesCollection";
import { useProfile } from "@/hooks/useProfile";
import { useSessionQuery } from "@/hooks/useSessionQuery";
import { InitializationScreen } from "./InitializationScreen";
import { LoginScreen } from "./LoginScreen";
import { useMinimumLoadingTime } from "@/hooks/useMinimumLoadingTime";
import type { Note } from "@/hooks/notes/useNotes";

export function NotesScreen() {
  const { state, logout } = useNillion();
  const { did, wallets } = state;
  const { isSuccess: isSessionReady } = useSessionQuery();
  const { isPending: isInitializing } = useInitializeSessionMutation();
  const { isPending: isLoggingIn } = useLoginMutation();
  const { isRegistered, isLoading: isProfileLoading } = useProfile();
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useCheckSubscriptionQuery();
  const { data: collectionId, isLoading: isCollectionLoading } = useNotesCollection();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const showCollectionLoading = useMinimumLoadingTime(isCollectionLoading, 500);

  // 1. MetaMask not connected, show login screen
  if (!did || !wallets.isMetaMaskConnected) {
    return <LoginScreen />;
  }

  // 2. Wallets connected, but session is being established
  if (isInitializing || isLoggingIn) {
    return <InitializationScreen />;
  }

  // 3. Wait for queries to finish loading before checking results
  if (isSessionReady && (isProfileLoading || isSubscriptionLoading)) {
    return <InitializationScreen />;
  }

  // 4. Session is ready, queries have loaded, but user profile/subscription might be missing
  if (isSessionReady && (!isRegistered || !subscriptionData?.subscribed)) {
    return <InitializationScreen />;
  }


  // 5. Show loading while collection is being set up
  if (showCollectionLoading || !collectionId) {
    const subscriptionStatus: "unknown" | "inactive" | "active" =
      isSubscriptionLoading || !subscriptionData ? "unknown" : subscriptionData.subscribed ? "active" : "inactive";
    const registrationStatus: "unknown" | "inactive" | "active" = !did
      ? "unknown"
      : isRegistered
        ? "active"
        : "inactive";
    const expiresAt = subscriptionData?.details?.expiresAt;

    return (
      <div className="flex flex-col h-screen max-w-7xl mx-auto w-full">
        <AppHeader title="nillion://passwordless_notes" />
        <div className="flex-grow flex items-center justify-center">
          <Loading message="Setting up notes collection..." />
        </div>
        <AppFooter
          did={did || ""}
          subscriptionStatus={subscriptionStatus}
          registrationStatus={registrationStatus}
          expiresAt={expiresAt}
          onLogout={logout}
        />
      </div>
    );
  }

  // 6. Fully ready - show notes interface
  const subscriptionStatus: "unknown" | "inactive" | "active" =
    isSubscriptionLoading || !subscriptionData ? "unknown" : subscriptionData.subscribed ? "active" : "inactive";
  const registrationStatus: "unknown" | "inactive" | "active" = !did
    ? "unknown"
    : isRegistered
      ? "active"
      : "inactive";
  const expiresAt = subscriptionData?.details?.expiresAt;

  const handleCreateNew = () => {
    setSelectedNote(null);
  };

  const handleSave = () => {
    // Note list will refresh automatically via React Query invalidation
  };

  const handleCopyCollectionId = async () => {
    if (collectionId) {
      await navigator.clipboard.writeText(collectionId);
      // You could add a toast notification here if you have one
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between px-8 pt-4">
        <AppHeader title="nillion://passwordless_notes" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-heading-secondary">Collection ID:</span>
          <code
            className="text-xs text-heading-secondary font-mono bg-button-bg px-2 py-1 rounded border border-border max-w-xs truncate"
            title={collectionId}
          >
            {collectionId}
          </code>
          <button
            onClick={handleCopyCollectionId}
            className="text-xs text-heading-secondary hover:text-foreground transition-colors"
            title="Copy collection ID"
          >
            📋
          </button>
        </div>
      </div>

      <div className="flex flex-grow min-h-0 px-8 pt-6 pb-8 gap-6">
        {/* Left Panel: Notes List */}
        <div className="w-80 flex-shrink-0 border border-border bg-panel-bg p-4 rounded-md">
          <NotesList
            selectedNoteId={selectedNote?._id || null}
            onSelectNote={setSelectedNote}
            onCreateNew={handleCreateNew}
          />
        </div>

        {/* Right Panel: Note Editor */}
        <div className="flex-grow border border-border bg-panel-bg p-4 rounded-md">
          <NoteEditor note={selectedNote} onSave={handleSave} />
        </div>
      </div>

      <AppFooter
        did={did || ""}
        subscriptionStatus={subscriptionStatus}
        registrationStatus={registrationStatus}
        expiresAt={expiresAt}
        onLogout={logout}
      />
    </div>
  );
}

