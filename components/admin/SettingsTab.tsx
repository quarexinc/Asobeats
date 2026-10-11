"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FaqItem, Settings } from "@/lib/types";
import { CloseIcon, PlusIcon } from "../icons";
import { Panel, useToast } from "./ui";
import { api, uploadFile, type StorageMode } from "./uploader";

export default function SettingsTab({ settings, storageMode }: { settings: Settings; storageMode: StorageMode }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));
  const setFaq = (i: number, part: Partial<FaqItem>) => set("faq", s.faq.map((f, j) => (j === i ? { ...f, ...part } : f)));
  const moveFaq = (i: number, d: -1 | 1) => {
    const arr = [...s.faq];
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set("faq", arr);
  };

  async function save() {
    setSaving(true);
    try {
      await api("/api/admin/settings", "PUT", s);
      toast("Ayarlar kaydedildi");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "bad");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAbout(file: File) {
    setUploading(true);
    try {
      const url = await uploadFile(file, { mode: storageMode, kind: "public", folder: "site", filename: file.name });
      set("aboutImage", url);
    } catch (e) {
      toast((e as Error).message, "bad");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="pb-24">
      <h1 className="font-wide text-3xl font-black tracking-[-0.04em] sm:text-4xl">Ayarlar</h1>
      <p className="mt-2 text-sm text-ash">Ödeme, site yazıları, sosyal medya ve SSS.</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Ödeme ve teslimat" className="xl:col-span-2">
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {(
              [
                ["instant", "Anında teslim", "Sipariş oluşturulunca MP3 hemen açılır. Ödeme sistemi bağlanana kadar test ve ücretsiz dağıtım için."],
                ["manual", "Manuel onay (havale/EFT)", "Alıcı ödeme bilgilerini görür. Sen “Ödemeyi onayla” deyince MP3 otomatik açılır."],
              ] as const
            ).map(([id, title, desc]) => (
              <button
                key={id}
                type="button"
                onClick={() => set("paymentMode", id)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  s.paymentMode === id ? "border-bone bg-bone/[0.04]" : "border-line hover:border-fog"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className={`grid h-4 w-4 place-items-center rounded-full border ${s.paymentMode === id ? "border-bone" : "border-ash"}`}>
                    {s.paymentMode === id && <span className="h-2 w-2 rounded-full bg-bone" />}
                  </span>
                  {title}
                </span>
                <span className="mt-2 block text-sm text-ash">{desc}</span>
              </button>
            ))}
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-xs text-ash">Ödeme bilgileri (manuel onayda alıcıya gösterilir)</span>
              <textarea className="field" rows={4} value={s.bankInfo} onChange={(e) => set("bankInfo", e.target.value)} />
            </label>
          </div>
        </Panel>

        <Panel title="Ana sayfa ve hakkımda">
          <div className="space-y-4 p-5">
            <F label="Ana sayfa tanıtım yazısı">
              <textarea className="field" rows={3} value={s.heroText} onChange={(e) => set("heroText", e.target.value)} />
            </F>
            <F label="Hakkımda başlığı">
              <input className="field" value={s.aboutTitle} onChange={(e) => set("aboutTitle", e.target.value)} />
            </F>
            <F label="Hakkımda yazısı (paragrafları boş satırla ayır)">
              <textarea className="field" rows={7} value={s.aboutText} onChange={(e) => set("aboutText", e.target.value)} />
            </F>
            <div>
              <span className="mb-1.5 block text-xs text-ash">Hakkımda fotoğrafı</span>
              <div className="flex items-center gap-4">
                {s.aboutImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.aboutImage} alt="" className="h-20 w-16 rounded-xl object-cover grayscale" />
                ) : (
                  <div className="h-20 w-16 rounded-xl border border-dashed border-line" />
                )}
                <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-xs text-fog hover:border-bone hover:text-bone">
                  {uploading ? "Yükleniyor…" : s.aboutImage ? "Değiştir" : "Fotoğraf seç"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAbout(e.target.files[0])} />
                </label>
                {s.aboutImage && (
                  <button onClick={() => set("aboutImage", "")} className="text-xs text-ash hover:text-bad">
                    Kaldır
                  </button>
                )}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="İletişim ve sosyal medya">
          <div className="space-y-4 p-5">
            <F label="E-posta">
              <input className="field" type="email" value={s.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
            </F>
            <F label="Instagram linki">
              <input className="field" value={s.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="https://instagram.com/asobeats" />
            </F>
            <F label="YouTube linki">
              <input className="field" value={s.youtube} onChange={(e) => set("youtube", e.target.value)} placeholder="https://youtube.com/@asobeats" />
            </F>
            <F label="Spotify linki">
              <input className="field" value={s.spotify} onChange={(e) => set("spotify", e.target.value)} placeholder="https://open.spotify.com/artist/…" />
            </F>
            <F label="WhatsApp numarası">
              <input className="field" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="90 5xx xxx xx xx" />
            </F>
            <p className="text-xs text-ash">Boş bıraktığın kanallar sitede görünmez.</p>
          </div>
        </Panel>

        <Panel
          title="Sık sorulan sorular"
          className="xl:col-span-2"
          action={
            <button onClick={() => set("faq", [...s.faq, { q: "", a: "" }])} className="inline-flex items-center gap-1.5 text-sm text-fog hover:text-bone">
              <PlusIcon className="h-4 w-4" /> Soru ekle
            </button>
          }
        >
          <ul className="divide-y divide-line">
            {s.faq.map((f, i) => (
              <li key={i} className="grid gap-3 p-5 md:grid-cols-[1fr_1.4fr_auto]">
                <input className="field" value={f.q} onChange={(e) => setFaq(i, { q: e.target.value })} placeholder="Soru" />
                <textarea className="field !min-h-[3.2rem]" rows={2} value={f.a} onChange={(e) => setFaq(i, { a: e.target.value })} placeholder="Cevap" />
                <div className="flex gap-1 md:flex-col">
                  <button onClick={() => moveFaq(i, -1)} className="rounded-lg border border-line px-2.5 py-1 text-xs text-ash hover:text-bone" aria-label="Yukarı taşı">↑</button>
                  <button onClick={() => moveFaq(i, 1)} className="rounded-lg border border-line px-2.5 py-1 text-xs text-ash hover:text-bone" aria-label="Aşağı taşı">↓</button>
                  <button onClick={() => set("faq", s.faq.filter((_, j) => j !== i))} className="grid place-items-center rounded-lg border border-line px-2.5 py-1 text-ash hover:text-bad" aria-label="Sil">
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={save}
          disabled={saving || uploading}
          className="rounded-full bg-bone px-6 py-3.5 text-sm font-semibold text-ink shadow-[0_20px_50px_-10px_rgba(0,0,0,.9)] transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Ayarları kaydet"}
        </button>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-ash">{label}</span>
      {children}
    </label>
  );
}
