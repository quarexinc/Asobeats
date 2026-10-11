"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Message } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Empty, Panel, useToast } from "./ui";
import { api } from "./uploader";

export default function MessagesTab({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);

  async function expand(m: Message) {
    setOpen(open === m.id ? null : m.id);
    if (!m.read) {
      await api(`/api/admin/messages/${m.id}`, "PATCH", { read: true }).catch(() => undefined);
      router.refresh();
    }
  }

  async function remove(m: Message) {
    if (!confirm("Mesaj silinsin mi?")) return;
    try {
      await api(`/api/admin/messages/${m.id}`, "DELETE");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "bad");
    }
  }

  return (
    <div>
      <h1 className="font-wide text-3xl font-black tracking-[-0.04em] sm:text-4xl">Mesajlar</h1>
      <p className="mt-2 text-sm text-ash">İletişim formundan gelen mesajlar.</p>

      <Panel className="mt-8">
        {messages.length === 0 ? (
          <Empty>Henüz mesaj yok.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {messages.map((m) => (
              <li key={m.id}>
                <button onClick={() => expand(m)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02]">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-bone"}`} aria-label={m.read ? "Okundu" : "Okunmadı"} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${m.read ? "text-fog" : "font-semibold"}`}>
                      {m.name} <span className="font-normal text-ash">· {m.subject}</span>
                    </p>
                    <p className="truncate text-xs text-ash">{m.message}</p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-ash sm:block">{formatDate(m.createdAt)}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open === m.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pl-11">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-fog">{m.message}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject + " | Aso Beats")}`}
                            className="rounded-full bg-bone px-4 py-2 text-xs font-semibold text-ink"
                          >
                            {m.email} adresine yanıtla
                          </a>
                          <button onClick={() => remove(m)} className="rounded-full border border-line px-4 py-2 text-xs text-fog hover:border-bad hover:text-bad">
                            Sil
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
