"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import type { Beat } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Cover } from "../player/PlayerBar";
import { PlusIcon } from "../icons";
import { Empty, Panel, Toggle, useToast } from "./ui";
import BeatEditor from "./BeatEditor";
import { api, type StorageMode } from "./uploader";

export default function BeatsTab({ beats, storageMode }: { beats: Beat[]; storageMode: StorageMode }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<Beat | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function patch(b: Beat, data: Partial<Beat>) {
    setBusyId(b.id);
    try {
      await api(`/api/admin/beats/${b.id}`, "PATCH", data);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "bad");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(b: Beat) {
    const msg = b.salesCount
      ? `"${b.title}" silinsin mi? Satın alanlar dosyalarını indirmeye devam edebilir.`
      : `"${b.title}" ve dosyaları kalıcı olarak silinsin mi?`;
    if (!confirm(msg)) return;
    setBusyId(b.id);
    try {
      await api(`/api/admin/beats/${b.id}`, "DELETE");
      toast("Beat silindi");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "bad");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-wide text-3xl font-black tracking-[-0.04em] sm:text-4xl">Beatler</h1>
          <p className="mt-2 text-sm text-ash">Satışa koy, düzenle, yayından kaldır.</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
        >
          <PlusIcon className="h-4 w-4" /> Yeni beat
        </button>
      </div>

      <Panel className="mt-8">
        {beats.length === 0 ? (
          <Empty>Henüz beat yok. “Yeni beat” ile ilkini ekle.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {beats.map((b) => (
              <li key={b.id} className={`grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center ${busyId === b.id ? "opacity-50" : ""}`}>
                <div className="flex min-w-0 items-center gap-4">
                  <Cover url={b.coverUrl} title={b.title} className="h-14 w-14 rounded-xl" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{b.title}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-ash">
                      <span className="text-bone">{formatPrice(b.price)}</span>
                      {b.genre && <span>{b.genre}</span>}
                      {b.bpm && <span>{b.bpm} BPM</span>}
                      <span>{b.salesCount} satış</span>
                      {!b.previewUrl && <span className="text-warn">Demo yok</span>}
                      {b.exclusive && <span>{b.sold ? "Tek satış · satıldı" : "Tek satış"}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Toggle checked={b.published} onChange={(v) => patch(b, { published: v })} label="Yayında" />
                  <Toggle checked={b.featured} onChange={(v) => patch(b, { featured: v })} label="Öne çıkar" />
                  {b.exclusive && <Toggle checked={b.sold} onChange={(v) => patch(b, { sold: v })} label="Satıldı" />}
                  <div className="ml-auto flex gap-2 md:ml-0">
                    <a href={`/beat/${b.id}`} target="_blank" className="rounded-full border border-line px-3.5 py-2 text-xs text-fog hover:border-bone hover:text-bone">
                      Gör
                    </a>
                    <button onClick={() => setEditing(b)} className="rounded-full border border-line px-3.5 py-2 text-xs text-fog hover:border-bone hover:text-bone">
                      Düzenle
                    </button>
                    <button onClick={() => remove(b)} className="rounded-full border border-line px-3.5 py-2 text-xs text-fog hover:border-bad hover:text-bad">
                      Sil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <AnimatePresence>
        {editing && (
          <BeatEditor
            key={editing === "new" ? "new" : editing.id}
            beat={editing === "new" ? null : editing}
            storageMode={storageMode}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              toast(editing === "new" ? "Beat satışa kondu" : "Değişiklikler kaydedildi");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
