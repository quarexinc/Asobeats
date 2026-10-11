import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBeat, getSettings, listPublicBeats, toPublic } from "@/lib/db";
import { formatTime } from "@/lib/format";
import PlayButton from "@/components/player/PlayButton";
import Waveform from "@/components/player/Waveform";
import { Cover } from "@/components/player/PlayerBar";
import BuyForm from "@/components/BuyForm";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const beat = await getBeat((await params).id);
  if (!beat || !beat.published) return { title: "Beat bulunamadı" };
  return {
    title: beat.title,
    description: beat.description?.slice(0, 160) || `${beat.title}: Aso Beats beat mağazası`,
    openGraph: beat.coverUrl ? { images: [beat.coverUrl] } : undefined,
  };
}

export default async function BeatPage({ params }: Props) {
  const { id } = await params;
  const raw = await getBeat(id);
  if (!raw || !raw.published) notFound();
  const beat = toPublic(raw);
  const [all, settings] = await Promise.all([listPublicBeats(), getSettings()]);
  const others = all.filter((b) => b.id !== beat.id && !b.sold).slice(0, 4);

  const specs = [
    ["Tür", beat.genre],
    ["Tempo", beat.bpm ? `${beat.bpm} BPM` : undefined],
    ["Ton", beat.musicalKey],
    ["Süre", beat.durationSec ? formatTime(beat.durationSec) : undefined],
    ["Teslim", "MP3, sipariş sayfasından"],
    ["Satış", beat.exclusive ? "Tek satış, satılınca kaldırılır" : "Standart"],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 sm:px-8 sm:pt-40">
      <Link href="/#beatler" className="text-sm text-ash hover:text-bone">
        ← Tüm beatler
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-line">
            <Cover url={beat.coverUrl} title={beat.title} className="aspect-square w-full text-4xl" />
            <div className="absolute bottom-4 left-4">
              <PlayButton beat={beat} queue={[beat, ...others]} size={68} />
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <h1 className="font-wide text-4xl font-black leading-[0.95] tracking-[-0.045em] sm:text-6xl">{beat.title}</h1>
            {beat.tags.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {beat.tags.map((t) => (
                  <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-fog">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          <Reveal delay={0.08} className="mt-8 rounded-[24px] border border-line bg-coal p-5">
            <div className="flex items-center justify-between text-xs text-ash">
              <span>15 saniyelik demo</span>
              <span>Dalga formuna tıklayıp ileri sar</span>
            </div>
            <Waveform beat={beat} queue={[beat, ...others]} bars={100} className="mt-4 h-20" gap={2} />
          </Reveal>

          {beat.description && (
            <Reveal delay={0.12}>
              <p className="mt-8 whitespace-pre-line leading-relaxed text-fog">{beat.description}</p>
            </Reveal>
          )}

          <Reveal delay={0.14}>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {specs.map(([k, v]) => (
                <div key={k} className="bg-ink px-4 py-3.5">
                  <dt className="text-xs text-ash">{k}</dt>
                  <dd className="mt-1 text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.16}>
            <div id="satin-al" className="mt-10 scroll-mt-28">
              <h2 className="mb-4 text-lg font-semibold">Satın al</h2>
              <BuyForm beatId={beat.id} price={beat.price} mode={settings.paymentMode} sold={beat.sold} />
            </div>
          </Reveal>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-28">
          <h2 className="font-wide text-2xl font-black tracking-[-0.03em] sm:text-3xl">Bunları da dinle</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((b, i) => (
              <Reveal as="li" key={b.id} delay={i * 0.06}>
                <div className="group relative overflow-hidden rounded-2xl border border-line">
                  <Cover url={b.coverUrl} title={b.title} className="aspect-square w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <Link href={`/beat/${b.id}`} className="min-w-0 after:absolute after:inset-0">
                      <p className="truncate font-semibold">{b.title}</p>
                      <p className="truncate text-xs text-fog">{[b.genre, b.bpm && `${b.bpm} BPM`].filter(Boolean).join(" · ")}</p>
                    </Link>
                    <div className="relative z-10">
                      <PlayButton beat={b} queue={others} size={40} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
