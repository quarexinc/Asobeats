"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const IntroCtx = createContext<{ done: boolean }>({ done: true });
export const useIntroDone = () => useContext(IntroCtx).done;

const KEY = "aso_intro_seen";
const EASE = [0.16, 1, 0.3, 1] as const;
const TOTAL_MS = 3000;

export function IntroProvider({ children }: { children: React.ReactNode }) {
  // "show" sunucuda true başlar ki ilk ziyarette site bir anlığına görünmesin
  const [show, setShow] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen) {
      setShow(false);
      setDone(true);
    }
  }, []);

  const finish = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  };

  useEffect(() => {
    document.documentElement.style.overflow = show ? "hidden" : "";
  }, [show]);

  return (
    <IntroCtx.Provider value={{ done }}>
      <AnimatePresence onExitComplete={() => setDone(true)}>
        {show && <IntroScreen key="intro" onFinish={finish} />}
      </AnimatePresence>
      {children}
    </IntroCtx.Provider>
  );
}

const WORD_1 = "ASO".split("");
const WORD_2 = "BEATS".split("");

function IntroScreen({ onFinish }: { onFinish: () => void }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const bars = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => {
        const center = 1 - Math.abs(i - 27.5) / 28;
        return {
          h: 0.15 + center * 0.85,
          d: 0.5 + ((i * 37) % 11) / 10,
          delay: ((i * 53) % 17) / 20,
        };
      }),
    [],
  );

  useEffect(() => {
    const total = reduce ? 700 : TOTAL_MS;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (total - 500));
      // yavaşlayan sayaç
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const t1 = setTimeout(() => setLeaving(true), total - 450);
    const t2 = setTimeout(onFinish, total);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const letter = (ch: string, i: number, base: number) => (
    <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
      <motion.span
        className="metal inline-block"
        initial={{ y: "110%", rotate: 6 }}
        animate={leaving ? { y: "-115%", rotate: -4, filter: "blur(6px)" } : { y: "0%", rotate: 0 }}
        transition={
          leaving
            ? { duration: 0.55, delay: i * 0.025, ease: [0.7, 0, 0.84, 0] }
            : { duration: 1.1, delay: base + i * 0.06, ease: EASE }
        }
      >
        {ch}
      </motion.span>
    </span>
  );

  return (
    <motion.div
      className="intro-overlay fixed inset-0 z-[100] cursor-pointer"
      onClick={() => setLeaving(true)}
      onAnimationComplete={() => undefined}
      aria-label="Aso Beats yükleniyor"
      role="status"
    >
      {/* Ayrılan paneller */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-ink"
        exit={{ y: "-100%" }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
        exit={{ y: "100%" }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Ortadaki ışık */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.09),transparent_65%)]"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 1.4 : 1 }}
        transition={{ duration: leaving ? 0.5 : 1.6, ease: EASE }}
      />

      {/* Ekolayzer barları */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto flex h-[38vh] max-w-5xl -translate-y-1/2 items-center gap-[3px] px-6 sm:gap-[5px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 0.14 }}
        transition={{ duration: leaving ? 0.3 : 0.8, delay: leaving ? 0 : 0.2 }}
      >
        {bars.map((b, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-full bg-bone"
            style={{ height: `${b.h * 100}%` }}
            initial={{ scaleY: 0.02 }}
            animate={reduce ? { scaleY: 0.4 } : { scaleY: [0.05, b.h, 0.25, b.h * 0.8, 0.1] }}
            transition={{ duration: b.d * 1.6, delay: b.delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* Yatay çizgi */}
      <motion.div
        className="absolute left-0 top-1/2 h-px w-full origin-left bg-gradient-to-r from-transparent via-bone/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: leaving ? 0 : 1, opacity: leaving ? 0 : 1 }}
        transition={{ duration: leaving ? 0.4 : 1.2, ease: EASE }}
      />

      {/* Logo */}
      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="text-center">
          <h1 className="font-wide flex flex-col items-center text-[19vw] font-black leading-[0.82] tracking-[-0.04em] sm:flex-row sm:gap-[0.24em] sm:text-[10.5vw]">
            <span>{WORD_1.map((c, i) => letter(c, i, 0.25))}</span>
            <span>{WORD_2.map((c, i) => letter(c, i + 3, 0.25))}</span>
          </h1>
          <motion.p
            className="mt-6 text-[13px] text-fog sm:mt-8"
            initial={{ opacity: 0, letterSpacing: "0.9em" }}
            animate={leaving ? { opacity: 0 } : { opacity: 1, letterSpacing: "0.35em" }}
            transition={{ duration: leaving ? 0.3 : 1.4, delay: leaving ? 0 : 0.9, ease: EASE }}
          >
            prod. by aso
          </motion.p>
        </div>
      </div>

      {/* Alt sayaç */}
      <motion.div
        className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-5 sm:px-10 sm:pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-xs text-ash">Beat mağazası hazırlanıyor</span>
        <span className="font-wide text-4xl font-black tabular-nums text-bone/90 sm:text-6xl">
          {count.toString().padStart(3, "0")}
        </span>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-bone"
        style={{ width: `${count}%` }}
        animate={{ opacity: leaving ? 0 : 1 }}
      />
    </motion.div>
  );
}
