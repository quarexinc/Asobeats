"use client";

import { useState } from "react";

export default function CopyButton({ text, absolute, label = "Kopyala" }: { text: string; absolute?: boolean; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const value = absolute ? window.location.origin + text : text;
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          window.prompt("Kopyala:", value);
        }
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
      className="rounded-full border border-line px-3 py-1.5 text-xs text-bone transition-colors hover:border-bone"
    >
      {done ? "Kopyalandı" : label}
    </button>
  );
}
