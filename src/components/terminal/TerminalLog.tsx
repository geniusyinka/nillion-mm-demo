import { useEffect, useRef } from "react";
import { useLogContext } from "@/context/LogContext";

export function TerminalLog() {
  const { logs } = useLogContext();
  const logContainerRef = useRef<HTMLPreElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Auto-scroll needs to run on every log change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="border border-border p-0 h-full max-h-full flex flex-col bg-code-bg shadow-[0_0_20px_rgba(180,190,254,0.15)] transition-all duration-300">
      <pre
        ref={logContainerRef}
        className="p-4 flex-grow overflow-y-auto whitespace-pre-wrap break-all text-[13px] font-mono animate-in fade-in duration-500 tracking-wide leading-relaxed"
      >
        {logs.join("\n")}
        {"\n> "}
        <span className="animate-pulse text-accent">█</span>
      </pre>
    </section>
  );
}
