"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { formatPrice, formatTime } from "@/lib/format";
import { CloseIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, VolumeIcon } from "../icons";
import { usePlayer, useProgress } from "./PlayerProvider";
import Waveform from "./Waveform";

export default function PlayerBar() {
  const p = usePlayer();
  const { time, duration } = useProgress();
  const beat = p.current;

  return (
    <AnimatePresence>
      {beat && (
        <motion.div
          key="bar"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-5 sm:pb-5"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-[22px] border border-line bg-[#0c0c0c]/90 p-2.5 pr-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl sm:gap-5 sm:p-3 sm:pr-5">
            <Link href={`/beat/${beat.id}`} className="flex min-w-0 items-center gap-3 sm:w-64">
              <Cover url={beat.coverUrl} title={beat.title} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{beat.title}</p>
                <p className="truncate text-xs text-ash">
                  Demo · {[beat.bpm && `${beat.bpm} BPM`, beat.musicalKey].filter(Boolean).join(" · ") || "Aso Beats"}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={p.prev} aria-label="Önceki beat" className="hidden h-9 w-9 place-items-center rounded-full text-fog hover:text-bone sm:grid">
                <PrevIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => p.toggle(beat)}
                aria-label={p.playing ? "Duraklat" : "Çal"}
                className="grid h-11 w-11 place-items-center rounded-full bg-bone text-ink transition-transform active:scale-95"
              >
                {p.playing ? <PauseIcon className="h-4.5 w-4.5" /> : <PlayIcon className="ml-0.5 h-4.5 w-4.5" />}
              </button>
              <button onClick={p.next} aria-label="Sonraki beat" className="hidden h-9 w-9 place-items-center rounded-full text-fog hover:text-bone sm:grid">
                <NextIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
              <span className="w-9 text-right text-xs tabular-nums text-ash">{formatTime(time)}</span>
              <Waveform beat={beat} bars={90} className="h-8 flex-1" gap={2} />
              <span className="w-9 text-xs tabular-nums text-ash">{formatTime(duration)}</span>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <label className="hidden items-center gap-2 text-ash lg:flex">
                <VolumeIcon className="h-4 w-4" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={p.volume}
                  onChange={(e) => p.setVolume(Number(e.target.value))}
                  className="scrub w-20"
                  aria-label="Ses seviyesi"
                />
              </label>
              <Link
                href={`/beat/${beat.id}#satin-al`}
                className="rounded-full border border-line px-3.5 py-2 text-xs font-semibold transition-colors hover:border-bone hover:bg-bone hover:text-ink sm:px-4 sm:text-sm"
              >
                {beat.sold ? "Satıldı" : formatPrice(beat.price)}
              </Link>
              <button onClick={p.close} aria-label="Oynatıcıyı kapat" className="grid h-8 w-8 place-items-center rounded-full text-ash hover:text-bone">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* mobil ilerleme çizgisi */}
          <div className="mx-auto -mt-[3px] h-[3px] max-w-6xl overflow-hidden rounded-full px-5 md:hidden">
            <div className="h-full rounded-full bg-bone/70" style={{ width: `${(time / (duration || 15)) * 100}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Cover({ url, title, className = "h-11 w-11 rounded-xl" }: { url?: string; title: string; className?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={`shrink-0 object-cover ${className}`} />;
  }
  return (
    <div
      aria-hidden
      className={`grid shrink-0 place-items-center bg-[radial-gradient(circle_at_30%_25%,#4a4a4a,#111_70%)] font-wide text-[10px] font-black text-fog ${className}`}
    >
      {title.slice(0, 2).toUpperCase()}
    </div>
  );
}
