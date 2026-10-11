"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Beat } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { CloseIcon, PauseIcon, PlayIcon } from "../icons";
import { Toggle } from "./ui";
import { computePeaks, decodeAudio, makePreview, suggestPreviewStart } from "./audioTools";
import { api, uploadFile, type StorageMode } from "./uploader";

const GENRES = ["Trap", "Drill", "R&B", "Afro", "Boom Bap", "Pop", "Reggaeton", "Lo-fi", "Detroit", "Jersey Club", "Arabesk Trap"];
const KEYS = ["C", "Cm", "C#", "C#m", "D", "Dm", "D#", "D#m", "E", "Em", "F", "Fm", "F#", "F#m", "G", "Gm", "G#", "G#m", "A", "Am", "A#", "A#m", "B", "Bm"];
const DEMO = 15;

type Props = { beat: Beat | null; storageMode: StorageMode; onClose: () => void; onSaved: () => void };

export default function BeatEditor({ beat, storageMode, onClose, onSaved }: Props) {
  const [f, setF] = useState({
    title: beat?.title ?? "",
    price: beat?.price?.toString() ?? "",
    bpm: beat?.bpm?.toString() ?? "",
    musicalKey: beat?.musicalKey ?? "",
    genre: beat?.genre ?? "",
    tags: beat?.tags.join(", ") ?? "",
    description: beat?.description ?? "",
    exclusive: beat?.exclusive ?? false,
    published: beat?.published ?? true,
    featured: beat?.featured ?? false,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : beat?.coverUrl), [coverFile, beat?.coverUrl]);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [start, setStart] = useState(0);
  const [customPreview, setCustomPreview] = useState<File | null>(null);

  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  // demo dinleme
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose, saving]);

  async function pickAudio(file: File) {
    setError("");
    setAudioFile(file);
    setBuffer(null);
    setPeaks(null);
    setDemoUrl(null);
    setDecoding(true);
    try {
      const buf = await decodeAudio(file);
      setBuffer(buf);
      setPeaks(computePeaks(buf, 160));
      setStart(suggestPreviewStart(buf, DEMO));
      if (!f.title) set("title", file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim());
    } catch {
      setError("Ses dosyası okunamadı. MP3 ya da WAV yüklediğinden emin ol.");
    } finally {
      setDecoding(false);
    }
  }

  // başlangıç değişince demoyu yeniden üret
  useEffect(() => {
    if (!buffer) return;
    const t = setTimeout(() => {
      const url = URL.createObjectURL(makePreview(buffer, start, DEMO));
      setDemoUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
    }, 200);
    return () => clearTimeout(t);
  }, [buffer, start]);

  const duration = buffer?.duration ?? beat?.durationSec ?? 0;
  const maxStart = Math.max(0, duration - DEMO);

  function toggleDemo() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!f.title.trim()) return setError("Beat adını yaz.");
    if (!f.price || isNaN(Number(f.price.replace(",", ".")))) return setError("Fiyatı yaz.");
    if (!beat && !audioFile) return setError("Teslim edilecek MP3 dosyasını seç.");

    try {
      let coverUrl = beat?.coverUrl;
      let fileUrl = beat?.fileUrl;
      let fileName = beat?.fileName;
      let previewUrl = beat?.previewUrl;

      if (coverFile) {
        setSaving("Kapak yükleniyor…");
        coverUrl = await uploadFile(coverFile, {
          mode: storageMode,
          kind: "public",
          folder: "covers",
          filename: coverFile.name,
          onProgress: (p) => setSaving(`Kapak yükleniyor %${p}`),
        });
      }
      if (audioFile) {
        setSaving("MP3 yükleniyor…");
        fileUrl = await uploadFile(audioFile, {
          mode: storageMode,
          kind: "private",
          folder: "full",
          filename: audioFile.name,
          onProgress: (p) => setSaving(`MP3 yükleniyor %${p}`),
        });
        fileName = audioFile.name;
      }
      // sitedeki dalga formu demonun kendisini göstersin
      let demoPeaks = beat?.peaks;
      if (customPreview) {
        try {
          demoPeaks = computePeaks(await decodeAudio(customPreview), 120, 0, DEMO);
        } catch {}
      } else if (buffer) {
        demoPeaks = computePeaks(buffer, 120, start, DEMO);
      }

      if (customPreview) {
        setSaving("Demo yükleniyor…");
        previewUrl = await uploadFile(customPreview, {
          mode: storageMode,
          kind: "public",
          folder: "previews",
          filename: customPreview.name,
          onProgress: (p) => setSaving(`Demo yükleniyor %${p}`),
        });
      } else if (buffer) {
        setSaving("15 saniyelik demo hazırlanıyor…");
        const demo = makePreview(buffer, start, DEMO);
        previewUrl = await uploadFile(demo, {
          mode: storageMode,
          kind: "public",
          folder: "previews",
          filename: `${f.title || "beat"}-demo.wav`,
          onProgress: (p) => setSaving(`Demo yükleniyor %${p}`),
        });
      }

      setSaving("Kaydediliyor…");
      const payload = {
        ...f,
        price: f.price.replace(",", "."),
        coverUrl,
        fileUrl,
        fileName,
        previewUrl,
        peaks: demoPeaks,
        durationSec: buffer?.duration ?? beat?.durationSec,
      };
      if (beat) await api(`/api/admin/beats/${beat.id}`, "PUT", payload);
      else await api("/api/admin/beats", "POST", payload);
      onSaved();
    } catch (err) {
      setError((err as Error).message || "Kaydedilemedi.");
      setSaving(null);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[80] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <motion.form
        onSubmit={save}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 36 }}
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-line bg-[#0a0a0a]"
        data-lenis-prevent
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
          <h2 className="font-wide text-xl font-black tracking-[-0.03em]">{beat ? "Beati düzenle" : "Yeni beat"}</h2>
          <button type="button" onClick={onClose} disabled={!!saving} className="grid h-9 w-9 place-items-center rounded-full border border-line" aria-label="Kapat">
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6 sm:px-7">
          {/* SES DOSYASI */}
          <section>
            <h3 className="text-sm font-semibold">Teslim edilecek dosya</h3>
            <p className="mt-1 text-xs text-ash">Satın alan kişi bu MP3'ü indirir. Dosya sitede asla herkese açık listelenmez.</p>
            <DropZone accept="audio/*,.mp3,.wav" onFile={pickAudio} className="mt-3">
              {decoding ? (
                <span className="text-sm text-fog">Ses analiz ediliyor…</span>
              ) : audioFile ? (
                <span className="text-sm">
                  <span className="text-bone">{audioFile.name}</span>
                  <span className="text-ash"> · {formatTime(duration)} · {(audioFile.size / 1024 / 1024).toFixed(1)} MB</span>
                </span>
              ) : beat?.fileName ? (
                <span className="text-sm">
                  <span className="text-bone">{beat.fileName}</span>
                  <span className="text-ash"> · değiştirmek için yeni dosya bırak</span>
                </span>
              ) : (
                <span className="text-sm text-fog">
                  MP3 dosyasını sürükle ya da <span className="text-bone underline underline-offset-4">seç</span>
                </span>
              )}
            </DropZone>
          </section>

          {/* DEMO */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">15 saniyelik demo</h3>
              {buffer && (
                <span className="text-xs text-ash tabular-nums">
                  {formatTime(start)} – {formatTime(Math.min(duration, start + DEMO))}
                </span>
              )}
            </div>
            {buffer && peaks ? (
              <>
                <p className="mt-1 text-xs text-ash">En güçlü bölüm otomatik seçildi. Dalgaya tıklayarak ya da kaydırarak değiştirebilirsin.</p>
                <div
                  className="relative mt-3 h-20 cursor-pointer rounded-xl bg-coal px-2"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const t = ((e.clientX - r.left) / r.width) * duration - DEMO / 2;
                    setStart(Math.max(0, Math.min(maxStart, Math.round(t))));
                  }}
                >
                  <div className="absolute inset-x-2 inset-y-2 flex items-center gap-[2px]">
                    {peaks.map((p, i) => {
                      const t = (i / peaks.length) * duration;
                      const inWin = t >= start && t <= start + DEMO;
                      return <span key={i} className={`flex-1 rounded-full ${inWin ? "bg-bone" : "bg-[#3a3a3a]"}`} style={{ height: `${Math.max(6, p * 100)}%` }} />;
                    })}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-y-0 rounded-lg border border-bone/60 bg-bone/[0.06]"
                    style={{ left: `calc(${(start / duration) * 100}% )`, width: `${(Math.min(DEMO, duration) / duration) * 100}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleDemo}
                    disabled={!demoUrl || !!customPreview}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bone text-ink disabled:opacity-40"
                    aria-label="Demoyu dinle"
                  >
                    {demoPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={maxStart}
                    step={1}
                    value={start}
                    onChange={(e) => setStart(Number(e.target.value))}
                    className="scrub flex-1"
                    aria-label="Demo başlangıcı"
                  />
                  {demoUrl && (
                    <audio
                      ref={audioRef}
                      src={demoUrl}
                      onPlay={() => setDemoPlaying(true)}
                      onPause={() => setDemoPlaying(false)}
                      onEnded={() => setDemoPlaying(false)}
                    />
                  )}
                </div>
              </>
            ) : (
              <p className="mt-1 text-xs text-ash">
                {beat?.previewUrl
                  ? "Mevcut demo kullanılıyor. Yeni bir MP3 yüklersen demo ondan yeniden hazırlanır."
                  : "MP3'ü yüklediğinde demo otomatik hazırlanır."}
              </p>
            )}
            <details className="mt-3 text-xs text-ash">
              <summary className="cursor-pointer hover:text-bone">Kendi demo dosyamı yüklemek istiyorum</summary>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setCustomPreview(e.target.files?.[0] ?? null)}
                  className="text-xs file:mr-3 file:rounded-full file:border-0 file:bg-steel file:px-3 file:py-1.5 file:text-bone"
                />
                {customPreview && (
                  <button type="button" onClick={() => setCustomPreview(null)} className="text-bone underline">
                    Kaldır
                  </button>
                )}
              </div>
              <p className="mt-2">Sitede yalnızca ilk 15 saniyesi çalınır.</p>
            </details>
          </section>

          {/* KAPAK */}
          <section className="flex items-start gap-5">
            <div className="w-28 shrink-0">
              <DropZone accept="image/*" onFile={setCoverFile} className="aspect-square !p-0 overflow-hidden">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-2 text-center text-xs text-ash">Kapak / logo seç</span>
                )}
              </DropZone>
            </div>
            <div className="text-xs leading-relaxed text-ash">
              <p className="text-sm font-semibold text-bone">Kapak görseli</p>
              <p className="mt-1">Kare görsel önerilir (en az 800×800). JPG, PNG ya da WEBP.</p>
            </div>
          </section>

          {/* BİLGİLER */}
          <section className="grid gap-4 sm:grid-cols-2">
            <L label="Beat adı" className="sm:col-span-2">
              <input className="field" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="ör. Gece Yarısı" required />
            </L>
            <L label="Fiyat (₺)">
              <input className="field" inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="750" required />
            </L>
            <L label="Tür">
              <input className="field" list="genres" value={f.genre} onChange={(e) => set("genre", e.target.value)} placeholder="Trap" />
              <datalist id="genres">{GENRES.map((g) => <option key={g} value={g} />)}</datalist>
            </L>
            <L label="BPM">
              <input className="field" inputMode="numeric" value={f.bpm} onChange={(e) => set("bpm", e.target.value.replace(/\D/g, ""))} placeholder="140" />
            </L>
            <L label="Ton">
              <select className="field" value={f.musicalKey} onChange={(e) => set("musicalKey", e.target.value)}>
                <option value="">Seç</option>
                {KEYS.map((k) => <option key={k}>{k}</option>)}
              </select>
            </L>
            <L label="Etiketler (virgülle ayır)" className="sm:col-span-2">
              <input className="field" value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="karanlık, 808, melodik" />
            </L>
            <L label="Açıklama" className="sm:col-span-2">
              <textarea
                className="field"
                rows={4}
                value={f.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Beatin havası, kullanılan enstrümanlar, hangi tarz sanatçıya uygun olduğu…"
              />
            </L>
          </section>

          <section className="space-y-4 rounded-2xl border border-line p-5">
            <Toggle checked={f.published} onChange={(v) => set("published", v)} label="Sitede yayınla" />
            <Toggle checked={f.featured} onChange={(v) => set("featured", v)} label="Ana sayfada öne çıkar" />
            <Toggle checked={f.exclusive} onChange={(v) => set("exclusive", v)} label="Tek satış (satılınca otomatik kapanır)" />
          </section>
        </div>

        <footer className="border-t border-line px-5 py-4 sm:px-7">
          {error && <p className="mb-3 rounded-xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-sm text-bad">{error}</p>}
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} disabled={!!saving} className="rounded-full border border-line px-5 py-3 text-sm text-fog disabled:opacity-40">
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={!!saving || decoding}
              className="flex-1 rounded-full bg-bone px-5 py-3 text-sm font-semibold text-ink transition-opacity disabled:opacity-60"
            >
              {saving ?? (beat ? "Değişiklikleri kaydet" : "Satışa koy")}
            </button>
          </div>
        </footer>
      </motion.form>
    </motion.div>
  );
}

function L({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs text-ash">{label}</span>
      {children}
    </label>
  );
}

function DropZone({
  accept,
  onFile,
  children,
  className = "",
}: {
  accept: string;
  onFile: (f: File) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={`grid cursor-pointer place-items-center rounded-2xl border border-dashed p-6 transition-colors ${
        over ? "border-bone bg-bone/5" : "border-line hover:border-fog"
      } ${className}`}
    >
      {children}
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
