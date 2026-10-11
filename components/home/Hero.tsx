"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PublicBeat } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useIntroDone } from "../Intro";
import Waveform from "../player/Waveform";
import PlayButton from "../player/PlayButton";
import { Cover } from "../player/PlayerBar";
import { ArrowIcon } from "../icons";
import { scrollToId } from "../SmoothScroll";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero({ heroText, featured, beats }: { heroText: string; featured?: PublicBeat; beats: PublicBeat[] }) {
  const ready = useIntroDone();

  const rise = (i: number) => ({
    initial: { y: "105%" },
    animate: ready ? { y: "0%" } : {},
    transition: { duration: 1.2, delay: 0.05 + i * 0.05, ease: EASE },
  });
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1, delay, ease: EASE },
  });

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pt-40">
      {/* ışık */}
      <div className="pointer-events-none absolute left-1/2 top-[-30%] -z-10 h-[90vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.085),transparent_60%)]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[38%] -z-10 hidden h-px sm:block bg-gradient-to-r from-transparent via-line to-transparent"
        initial={{ scaleX: 0 }}
        animate={ready ? { scaleX: 1 } : {}}
        transition={{ duration: 1.6, ease: EASE }}
      />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <h1 aria-label="Aso Beats" className="font-wide font-black leading-[0.8] tracking-[-0.055em]">
          <span className="flex flex-wrap items-end gap-x-[0.18em] text-[19.5vw] sm:text-[12.4vw] 2xl:text-[188px]">
            {["ASO", "BEATS"].map((w, wi) => (
              <span key={w} className="block overflow-hidden pb-[0.04em]">
                <motion.span className="metal-sheen block" {...rise(wi)}>
                  {w}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-12 px-5 sm:mt-14 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:items-end">
        <div>
          <motion.p {...fade(0.35)} className="max-w-md text-lg leading-relaxed text-fog sm:text-xl">
            {heroText}
          </motion.p>
          <motion.div {...fade(0.45)} className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => scrollToId("beatler")}
              className="group inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
            >
              Beatleri dinle
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              href="/iletisim"
              className="inline-flex items-center rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-bone"
            >
              Özel beat iste
            </Link>
          </motion.div>
          <motion.dl {...fade(0.55)} className="mt-12 flex gap-10 text-sm">
            <div>
              <dt className="text-ash">Demo</dt>
              <dd className="mt-1 text-bone">15 saniye ücretsiz dinle</dd>
            </div>
            <div>
              <dt className="text-ash">Teslimat</dt>
              <dd className="mt-1 text-bone">Ödeme sonrası anında</dd>
            </div>
          </motion.dl>
        </div>

        {featured ? (
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease: EASE }}
            className="relative rounded-[28px] border border-line bg-gradient-to-b from-[#141414] to-[#070707] p-5 sm:p-7"
          >
            <div className="flex items-center gap-4">
              <Cover url={featured.coverUrl} title={featured.title} className="h-16 w-16 rounded-2xl sm:h-20 sm:w-20" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ash">{featured.featured ? "Öne çıkan beat" : "En yeni beat"}</p>
                <Link href={`/beat/${featured.id}`} className="font-wide mt-1 block truncate text-xl font-extrabold tracking-[-0.02em] hover:underline sm:text-2xl">
                  {featured.title}
                </Link>
                <p className="mt-1 truncate text-sm text-ash">
                  {[featured.genre, featured.bpm && `${featured.bpm} BPM`, featured.musicalKey].filter(Boolean).join(" · ")}
                </p>
              </div>
              <PlayButton beat={featured} queue={beats} size={60} />
            </div>
            <Waveform beat={featured} queue={beats} bars={84} className="mt-7 h-24 sm:h-28" gap={3} />
            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              <span className="text-sm text-ash">Demo 0:15 · tam sürüm satın alınca</span>
              <Link
                href={`/beat/${featured.id}#satin-al`}
                className="rounded-full bg-steel px-4 py-2 text-sm font-semibold transition-colors hover:bg-bone hover:text-ink"
              >
                {featured.sold ? "Satıldı" : formatPrice(featured.price)}
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div {...fade(0.4)} className="rounded-[28px] border border-dashed border-line p-8 text-sm text-ash">
            İlk beatler çok yakında burada olacak. Sana özel bir beat için{" "}
            <Link href="/iletisim" className="text-bone underline underline-offset-4">bana ulaş</Link>.
          </motion.div>
        )}
      </div>
    </section>
  );
}
