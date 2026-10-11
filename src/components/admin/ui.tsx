"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Order } from "@/lib/types";

export type AdminOrder = Omit<Order, "fileUrl"> & { hasFile: boolean };

type Toast = { id: number; text: string; tone: "ok" | "bad" };
const ToastCtx = createContext<(text: string, tone?: "ok" | "bad") => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: "ok" | "bad" = "ok") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text, tone }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={`rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
                t.tone === "ok" ? "border-line bg-[#141414]/95 text-bone" : "border-bad/30 bg-[#1d1010]/95 text-bad"
              }`}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function StatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    paid: ["Teslim edildi", "bg-ok/10 text-ok border-ok/25"],
    pending: ["Ödeme bekliyor", "bg-warn/10 text-warn border-warn/25"],
    cancelled: ["İptal", "bg-steel text-ash border-line"],
  } as const;
  const [label, cls] = map[status];
  return <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${cls}`}>{label}</span>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm"
    >
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-bone" : "bg-steel"}`}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={`absolute top-1 h-4 w-4 rounded-full ${checked ? "right-1 bg-ink" : "left-1 bg-ash"}`}
        />
      </span>
      <span className="text-fog">{label}</span>
    </button>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[22px] border border-line bg-coal ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          {title && <h2 className="font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-14 text-center text-sm text-ash">{children}</div>;
}
