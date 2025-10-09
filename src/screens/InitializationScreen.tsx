import { TerminalLog } from "@/components/terminal/TerminalLog";

export function InitializationScreen() {
  return (
    <div className="flex flex-col h-screen p-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-bold tracking-wider text-accent mb-2">nillion://secret_vault_initialization</h1>
        </div>

        <div className="flex-1 mb-6 min-h-0">
          <TerminalLog />
        </div>
      </div>
    </div>
  );
}
