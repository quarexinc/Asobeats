"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { PublicBeat } from "@/lib/types";

type PlayerState = {
  current: PublicBeat | null;
  playing: boolean;
  loading: boolean;
  queue: PublicBeat[];
};

type PlayerApi = PlayerState & {
  toggle: (beat: PublicBeat, queue?: PublicBeat[]) => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (fraction: number) => void;
  close: () => void;
  volume: number;
  setVolume: (v: number) => void;
};

const Ctx = createContext<PlayerApi | null>(null);

/* İlerleme ayrı bir mağazada tutulur; böylece her karede tüm sayfa yeniden çizilmez */
let progress = { time: 0, duration: 15 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const SERVER = { time: 0, duration: 15 };

export function useProgress() {
  return useSyncExternalStore(subscribe, () => progress, () => SERVER);
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("PlayerProvider eksik");
  return ctx;
}

export const DEMO_LIMIT = 15;

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    current: null,
    playing: false,
    loading: false,
    queue: [],
  });
  const [volume, setVolumeState] = useState(0.9);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const a = new Audio();
    a.preload = "auto";
    a.volume = 0.9;
    audioRef.current = a;

    let raf = 0;
    const tick = () => {
      const d = Math.min(isFinite(a.duration) ? a.duration : DEMO_LIMIT, DEMO_LIMIT);
      progress = { time: Math.min(a.currentTime, d), duration: d };
      emit();
      // demo 15 saniyeyi geçmesin
      if (a.currentTime >= DEMO_LIMIT) {
        a.pause();
        a.currentTime = 0;
        onEnd();
      }
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setState((s) => ({ ...s, playing: true, loading: false }));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setState((s) => ({ ...s, playing: false }));
      cancelAnimationFrame(raf);
      progress = { ...progress };
      emit();
    };
    const onWaiting = () => setState((s) => ({ ...s, loading: true }));
    const onCanPlay = () => setState((s) => ({ ...s, loading: false }));
    const onEnd = () => {
      const { queue, current } = stateRef.current;
      const i = queue.findIndex((b) => b.id === current?.id);
      const nextBeat = i >= 0 ? queue.slice(i + 1).find((b) => b.previewUrl) : undefined;
      if (nextBeat) play(nextBeat, queue);
      else {
        progress = { time: 0, duration: progress.duration };
        emit();
        setState((s) => ({ ...s, playing: false }));
      }
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("ended", onEnd);
    return () => {
      cancelAnimationFrame(raf);
      a.pause();
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback((beat: PublicBeat, queue?: PublicBeat[]) => {
    const a = audioRef.current;
    if (!a || !beat.previewUrl) return;
    if (stateRef.current.current?.id !== beat.id) {
      a.src = beat.previewUrl;
      a.currentTime = 0;
      progress = { time: 0, duration: DEMO_LIMIT };
      emit();
    }
    setState((s) => ({
      ...s,
      current: beat,
      loading: true,
      queue: queue ?? (s.queue.length ? s.queue : [beat]),
    }));
    a.play().catch(() => setState((s) => ({ ...s, loading: false, playing: false })));
  }, []);

  const toggle = useCallback(
    (beat: PublicBeat, queue?: PublicBeat[]) => {
      const a = audioRef.current;
      if (!a) return;
      if (stateRef.current.current?.id === beat.id && !a.paused) a.pause();
      else play(beat, queue);
    },
    [play],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const { queue, current } = stateRef.current;
      const list = queue.filter((b) => b.previewUrl);
      if (!list.length) return;
      const i = list.findIndex((b) => b.id === current?.id);
      const n = list[(i + dir + list.length) % list.length];
      if (n) play(n, queue);
    },
    [play],
  );

  const api = useMemo<PlayerApi>(
    () => ({
      ...state,
      toggle,
      pause: () => audioRef.current?.pause(),
      next: () => step(1),
      prev: () => step(-1),
      seek: (f: number) => {
        const a = audioRef.current;
        if (!a) return;
        a.currentTime = Math.max(0, Math.min(0.999, f)) * progress.duration;
        progress = { ...progress, time: a.currentTime };
        emit();
      },
      close: () => {
        audioRef.current?.pause();
        setState((s) => ({ ...s, current: null, playing: false }));
      },
      volume,
      setVolume: (v: number) => {
        setVolumeState(v);
        if (audioRef.current) audioRef.current.volume = v;
      },
    }),
    [state, toggle, step, volume],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
