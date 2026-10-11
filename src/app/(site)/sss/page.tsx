import Link from "next/link";
import type { Metadata } from "next";
import { getSettings } from "@/lib/db";
import FaqList from "@/components/FaqList";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sık Sorulan Sorular" };

export default async function FaqPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-32 sm:px-8 sm:pt-40 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <Reveal>
        <div className="lg:sticky lg:top-32">
          <p className="text-ash">SSS</p>
          <h1 className="font-wide mt-4 text-5xl font-black leading-[0.92] tracking-[-0.05em] sm:text-6xl">
            Sık sorulan sorular
          </h1>
          <p className="mt-6 max-w-sm text-fog">
            Aradığın cevap burada yoksa{" "}
            <Link href="/iletisim" className="text-bone underline underline-offset-4">
              bana yaz
            </Link>
            , genellikle aynı gün dönüyorum.
          </p>
        </div>
      </Reveal>
      <FaqList items={settings.faq} />
    </div>
  );
}
