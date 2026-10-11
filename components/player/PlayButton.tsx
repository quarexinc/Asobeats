"use client";

import type { PublicBeat } from "@/lib/types";
import { PauseIcon, PlayIcon } from "../icons";
import { usePlayer, useProgress } from "./PlayerProvider";

type Props = {
  beat: PublicBeat;
  queue?: PublicBeat[];
  size?: number;
  variant?: "solid" | "ghost";
  className?: string;
};

export default function PlayButton({ beat, queue, size = 44, variant = "solid", className = "" }: Props) {
  const { current, playing, loading, toggle } = usePlayer();
  const { time, duration } = useProgress();
  const isCurrent = current?.id === beat.id;
  const isPlaying = isCurrent && playing;
  const disabled = !beat.previewUrl;

  const r = size / 2 - 1.5;
  const c = 2 * Math.PI * r;
  const frac = isCurrent ? time / (duration || 15) : 0;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        toggle(beat, queue);
      }}
      aria-label={isPlaying ? `${beat.title} demosunu duraklat` : `${beat.title} demosunu dinle`}
      className={`group relative grid shrink-0 place-items-center rounded-full transition-[transform,background-color] duration-300 ease-out-expo active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
        variant === "solid"
          ? "bg-bone text-ink hover:scale-[1.06]"
          : "border border-line bg-ink/40 text-bone backdrop-blur hover:border-fog"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {isCurrent && (
        <svg className="pointer-events-none absolute inset-0 -rotate-90" width={size} height={size} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={variant === "solid" ? "rgba(0,0,0,.25)" : "#f3f3f3"}
            strokeWidth={2}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - frac)}
            strokeLinecap="round"
          />
        </svg>
      )}
      {isCurrent && loading ? (
        <span
          className="block animate-spin rounded-full border-2 border-current border-t-transparent"
          style={{ width: size * 0.36, height: size * 0.36 }}
        />
      ) : isPlaying ? (
        <PauseIcon style={{ width: size * 0.4, height: size * 0.4 }} />
      ) : (
        <PlayIcon style={{ width: size * 0.4, height: size * 0.4, marginLeft: size * 0.04 }} />
      )}
    </button>
  );
}
