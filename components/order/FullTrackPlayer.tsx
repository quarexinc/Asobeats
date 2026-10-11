"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/format";
import { PauseIcon, PlayIcon } from "../icons";
import { usePlayer } from "../player/PlayerProvider";

/** Satın alınan tam sürümü çalar (demo sınırı yok) */
export default function FullTrackPlayer({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const demo = usePlayer();
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const up = () => setTime(a.currentTime);
    const meta = () => setDur(a.duration);
    const play = () => setPlaying(true);
    const pause = () => setPlaying(false);
    a.addEventListener("timeupdate", up);
    a.addEventListener("loadedmetadata", meta);
    a.addEventListener("play", play);
    a.addEventListener("pause", pause);
    return () => {
      a.removeEventListener("timeupdate", up);
      a.removeEventListener("loadedmetadata", meta);
      a.removeEventListener("play", play);
      a.removeEventListener("pause", pause);
    };
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      demo.pause();
      a.play();
    } else a.pause();
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-coal p-4">
      <audio ref={ref} src={src} preload="metadata" />
      <button
        onClick={toggle}
        aria-label={playing ? `${title} duraklat` : `${title} çal`}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bone text-ink transition-transform active:scale-95"
      >
        {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="ml-0.5 h-5 w-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <input
          type="range"
          min={0}
          max={dur || 0}
          step={0.1}
          value={time}
          onChange={(e) => {
            if (ref.current) ref.current.currentTime = Number(e.target.value);
          }}
          className="scrub w-full"
          aria-label="Şarkıda ilerle"
        />
        <div className="mt-2 flex justify-between text-xs tabular-nums text-ash">
          <span>{formatTime(time)}</span>
          <span>Tam sürüm · {formatTime(dur)}</span>
        </div>
      </div>
    </div>
  );
}
