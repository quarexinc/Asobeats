import Link from "next/link";
import type { Metadata } from "next";
import { getSettings, listPublicBeats } from "@/lib/db";
import Reveal from "@/components/Reveal";
import { socialLinks } from "@/components/Footer";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hakkımda" };

export default async function AboutPage() {
  const [settings, beats] = await Promise.all([getSettings(), listPublicBeats()]);
  const genres = new Set(beats.map((b) => b.genre).filter(Boolean));
  const paragraphs = settings.aboutText.split(/\n\s*\n/).filter(Boolean);
  const socials = socialLinks(settings);

  const stats = [
    { n: beats.length, l: "beat yayında" },
    { n: genres.size || "—", l: "farklı tür" },
    { n: "15 sn", l: "ücretsiz demo" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 sm:px-8 sm:pt-40">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="text-ash">Hakkımda</p>
            <h1 className="font-wide mt-4 text-5xl font-black leading-[0.92] tracking-[-0.05em] sm:text-7xl">
              {settings.aboutTitle}
            </h1>
          </Reveal>
          <div className="mt-10 max-w-xl space-y-5 text-lg leading-relaxed text-fog">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.06 * (i + 1)}>
                <p className="whitespace-pre-line">{p}</p>
              </Reveal>
            ))}
          </div>
          {socials.length > 0 && (
            <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-fog transition-colors hover:border-bone hover:text-bone"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-line bg-[radial-gradient(circle_at_30%_20%,#2a2a2a,#050505_70%)]">
            {settings.aboutImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.aboutImage} alt="Aso" className="h-full w-full object-cover grayscale" />
            ) : (
              <div className="absolute inset-0 flex items-end gap-2 p-8 opacity-60" aria-hidden>
                {[22, 40, 64, 88, 100, 76, 52, 70, 34, 18].map((h, i) => (
                  <span key={i} className="flex-1 rounded-full bg-gradient-to-t from-[#1a1a1a] to-fog" style={{ height: `${h}%` }} />
                ))}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="font-wide text-2xl font-black tracking-[-0.03em] metal">ASO</p>
              <p className="text-sm text-fog">Producer, beatmaker</p>
            </div>
          </div>
        </Reveal>
      </div>

      <dl className="mt-24 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 0.06} className="bg-ink p-8">
            <dd className="font-wide text-5xl font-black tracking-[-0.04em] metal">{s.n}</dd>
            <dt className="mt-2 text-ash">{s.l}</dt>
          </Reveal>
        ))}
      </dl>

      <Reveal className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 sm:flex-row sm:items-center">
        <p className="max-w-md text-xl">Bir projen mi var? Birlikte çalışalım.</p>
        <Link
          href="/iletisim"
          className="group inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
        >
          Bana ulaş
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </div>
  );
}
