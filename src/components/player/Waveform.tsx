"use client";

import { useMemo } from "react";
import type { PublicBeat } from "@/lib/types";
import { usePlayer, useProgress } from "./PlayerProvider";

/** Dalga formu yoksa beat kimliğinden tutarlı sahte bir dalga üretir */
export function fallbackPeaks(seed: string, count = 64) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const r = ((h >>> 0) % 1000) / 1000;
    const env = 0.55 + 0.45 * Math.sin((i / count) * Math.PI);
    out.push(0.18 + r * 0.82 * env);
  }
  return out;
}

export function resample(peaks: number[], count: number) {
  if (peaks.length === count) return peaks;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const start = Math.floor((i / count) * peaks.length);
    const end = Math.max(start + 1, Math.floor(((i + 1) / count) * peaks.length));
    let m = 0;
    for (let j = start; j < end; j++) m = Math.max(m, peaks[j] ?? 0);
    out.push(m);
  }
  return out;
}

type Props = {
  beat: PublicBeat;
  queue?: PublicBeat[];
  bars?: number;
  className?: string;
  gap?: number;
  minHeight?: number;
};

export default function Waveform({ beat, queue, bars = 64, className = "", gap = 2, minHeight = 0.06 }: Props) {
  const { current, toggle, seek } = usePlayer();
  const { time, duration } = useProgress();
  const isCurrent = current?.id === beat.id;
  const pct = isCurrent ? Math.min(100, (time / (duration || 15)) * 100) : 0;

  const data = useMemo(() => {
    const src = beat.peaks?.length ? beat.peaks : fallbackPeaks(beat.id, bars);
    const max = Math.max(...src, 0.01);
    return resample(src, bars).map((p) => Math.max(minHeight, p / max));
  }, [beat.peaks, beat.id, bars, minHeight]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!beat.previewUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - rect.left) / rect.width;
    if (isCurrent) seek(f);
    else toggle(beat, queue);
  };

  const row = (cls: string) => (
    <div className="absolute inset-0 flex items-center" style={{ gap }}>
      {data.map((v, i) => (
        <span key={i} className={`flex-1 rounded-full ${cls}`} style={{ height: `${v * 100}%` }} />
      ))}
    </div>
  );

  return (
    <div
      role="slider"
      aria-label={`${beat.title} demo ilerlemesi`}
      aria-valuemin={0}
      aria-valuemax={15}
      aria-valuenow={Math.round(isCurrent ? time : 0)}
      tabIndex={-1}
      onClick={onClick}
      className={`relative cursor-pointer select-none ${className}`}
    >
      {row("bg-[#3a3a3a]")}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        {row("bg-bone")}
      </div>
    </div>
  );
}
