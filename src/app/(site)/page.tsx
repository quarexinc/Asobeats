import Link from "next/link";
import { getSettings, listPublicBeats } from "@/lib/db";
import Hero from "@/components/home/Hero";
import BeatList from "@/components/home/BeatList";
import Marquee from "@/components/home/Marquee";
import Reveal from "@/components/Reveal";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const STEPS = [
  { t: "Dinle", d: "Her beatin 15 saniyelik demosunu oynat, dalga formunun istediğin yerine tıkla." },
  { t: "Satın al", d: "Adını ve e-postanı yaz, siparişini oluştur. Kayıt ya da üyelik gerekmez." },
  { t: "İndir", d: "Ödeme onaylanınca tam MP3 sipariş sayfanda açılır. Linki sakla, istediğin zaman tekrar indir." },
];

export default async function HomePage() {
  const [beats, settings] = await Promise.all([listPublicBeats(), getSettings()]);
  const available = beats.filter((b) => !b.sold);
  const featured = available.find((b) => b.featured && b.previewUrl) ?? available.find((b) => b.previewUrl) ?? available[0];
  const genres = Array.from(new Set(beats.map((b) => b.genre).filter(Boolean))) as string[];
  const words = genres.length >= 3 ? genres : ["Trap", "Drill", "R&B", "Afro", "Boom Bap", "Melodik", ...genres];

  return (
    <>
      <Hero heroText={settings.heroText} featured={featured} beats={beats} />
      <Marquee words={words.slice(0, 8)} />

      <div className="pt-24 sm:pt-32">
        <BeatList beats={beats} />
      </div>

      <section className="mx-auto mt-32 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2 className="font-wide max-w-2xl text-3xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">
            Demodan stüdyoya üç adım
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.08} className="bg-ink p-7 sm:p-9">
              <span className="font-wide text-6xl font-black text-[#2a2a2a]">{i + 1}</span>
              <h3 className="mt-8 text-xl font-semibold">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-ash">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-32 max-w-6xl px-5 sm:px-8">
        <Reveal className="relative overflow-hidden rounded-[32px] border border-line bg-[radial-gradient(ellipse_at_top_left,#1d1d1d,#050505_60%)] px-7 py-14 sm:px-14 sm:py-20">
          <h2 className="font-wide max-w-3xl text-3xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl">
            Kafandaki sesi birlikte üretelim.
          </h2>
          <p className="mt-5 max-w-lg text-fog">
            Referans şarkılarını, BPM ve tarzını yaz; sana özel bir beat hazırlayayım.
          </p>
          <Link
            href="/iletisim"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
          >
            Bana ulaş
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <div aria-hidden className="pointer-events-none absolute -bottom-10 -right-6 flex h-56 items-end gap-2 opacity-25 sm:right-10">
            {[30, 55, 80, 100, 70, 90, 45, 65, 35, 20].map((h, i) => (
              <span key={i} className="w-3 rounded-full bg-gradient-to-t from-transparent to-fog sm:w-4" style={{ height: `${h}%` }} />
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
