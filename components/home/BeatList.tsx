"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PublicBeat } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import Waveform from "../player/Waveform";
import PlayButton from "../player/PlayButton";
import { Cover } from "../player/PlayerBar";
import { usePlayer } from "../player/PlayerProvider";
import { SearchIcon } from "../icons";

type Sort = "new" | "cheap" | "expensive";

export default function BeatList({ beats }: { beats: PublicBeat[] }) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("new");

  const genres = useMemo(
    () => Array.from(new Set(beats.map((b) => b.genre).filter(Boolean))) as string[],
    [beats],
  );

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr");
    let out = beats.filter((b) => {
      if (genre !== "all" && b.genre !== genre) return false;
      if (!term) return true;
      return [b.title, b.genre, b.musicalKey, ...(b.tags || [])]
        .filter(Boolean)
        .some((s) => s!.toLocaleLowerCase("tr").includes(term));
    });
    if (sort === "cheap") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "expensive") out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [beats, q, genre, sort]);

  return (
    <section id="beatler" className="mx-auto max-w-6xl scroll-mt-28 px-5 sm:px-8">
      <div className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-wide text-4xl font-black tracking-[-0.04em] sm:text-6xl">Beatler</h2>
          <p className="mt-3 text-ash">
            {beats.length ? `${beats.length} beat · her birinin 15 saniyelik demosunu dinleyebilirsin` : "Yeni beatler hazırlanıyor"}
          </p>
        </div>
        {beats.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Beat, tür ya da etiket ara"
                className="field !rounded-full !py-2.5 !pl-10 sm:w-64"
                aria-label="Beat ara"
              />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !rounded-full !py-2.5 sm:w-44" aria-label="Sırala">
              <option value="new">En yeni</option>
              <option value="cheap">Fiyat: düşükten</option>
              <option value="expensive">Fiyat: yüksekten</option>
            </select>
          </div>
        )}
      </div>

      {genres.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {["all", ...genres].map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`relative isolate rounded-full px-4 py-2 text-sm transition-colors ${
                genre === g ? "text-ink" : "text-fog hover:text-bone"
              }`}
            >
              {genre === g && (
                <motion.span layoutId="genre-pill" className="absolute inset-0 -z-10 rounded-full bg-bone" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">{g === "all" ? "Tümü" : g}</span>
            </button>
          ))}
        </div>
      )}

      <ul className="mt-4">
        <AnimatePresence initial={false}>
          {list.map((b, i) => (
            <motion.li
              key={b.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <BeatRow beat={b} queue={list} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {beats.length > 0 && list.length === 0 && (
        <p className="py-16 text-center text-ash">Aramana uyan beat yok. Farklı bir kelime ya da tür dene.</p>
      )}
      {beats.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-fog">Yeni beatler çok yakında burada.</p>
          <Link href="/iletisim" className="mt-4 inline-block text-sm text-bone underline underline-offset-4">
            Sana özel beat için bana ulaş
          </Link>
        </div>
      )}
    </section>
  );
}

function BeatRow({ beat, queue }: { beat: PublicBeat; queue: PublicBeat[] }) {
  const { current } = usePlayer();
  const isCurrent = current?.id === beat.id;
  const meta = [beat.bpm && `${beat.bpm} BPM`, beat.musicalKey].filter(Boolean).join(" · ");

  return (
    <div
      className={`group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-4 transition-colors sm:gap-5 md:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1.4fr)_130px_104px] ${
        beat.sold ? "opacity-50" : ""
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-x-3 inset-y-1 -z-10 rounded-2xl bg-coal transition-opacity duration-300 sm:-inset-x-4 ${
          isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
      <div className="relative">
        <Cover url={beat.coverUrl} title={beat.title} className="h-14 w-14 rounded-xl sm:h-16 sm:w-16" />
        <div className="absolute inset-0 grid place-items-center">
          <PlayButton beat={beat} queue={queue} size={36} variant="ghost" />
        </div>
      </div>

      <div className="min-w-0">
        <Link href={`/beat/${beat.id}`} className="block truncate font-semibold tracking-[-0.01em] hover:underline sm:text-lg">
          {beat.title}
        </Link>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-ash">
          {beat.genre && <span>{beat.genre}</span>}
          {beat.exclusive && !beat.sold && <span className="rounded-full border border-line px-2 py-px text-[11px] text-fog">Tek satış</span>}
          {beat.sold && <span className="rounded-full bg-steel px-2 py-px text-[11px] text-fog">Satıldı</span>}
          <span className="md:hidden">{meta}</span>
        </p>
      </div>

      <Waveform beat={beat} queue={queue} bars={70} className="hidden h-10 md:block" gap={2} />

      <p className="hidden text-sm tabular-nums text-ash md:block">{meta || "—"}</p>

      <Link
        href={`/beat/${beat.id}#satin-al`}
        className={`justify-self-end whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold tabular-nums transition-colors ${
          beat.sold ? "pointer-events-none bg-steel text-ash" : "border border-line hover:border-bone hover:bg-bone hover:text-ink"
        }`}
      >
        {beat.sold ? "Satıldı" : formatPrice(beat.price)}
      </Link>
    </div>
  );
}
