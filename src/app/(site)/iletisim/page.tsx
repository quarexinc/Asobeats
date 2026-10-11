import type { Metadata } from "next";
import { getSettings } from "@/lib/db";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { socialLinks } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bana Ulaş" };

export default async function ContactPage() {
  const settings = await getSettings();
  const socials = socialLinks(settings);

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-32 sm:px-8 sm:pt-40 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div>
        <Reveal>
          <p className="text-ash">Bana ulaş</p>
          <h1 className="font-wide mt-4 text-5xl font-black leading-[0.92] tracking-[-0.05em] sm:text-7xl">
            Bir şey mi üretelim?
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-fog">
            Özel beat siparişi, işbirliği ya da satın aldığın bir beatle ilgili soru: formu doldur, e-postana dönüş yapayım.
          </p>
        </Reveal>

        {socials.length > 0 && (
          <Reveal delay={0.1}>
            <ul className="mt-12 border-t border-line">
              {socials.map(({ href, label, Icon }) => (
                <li key={label} className="border-b border-line">
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 py-5"
                  >
                    <Icon className="h-5 w-5 text-ash transition-colors group-hover:text-bone" />
                    <span className="text-fog transition-colors group-hover:text-bone">{label}</span>
                    <span className="ml-auto truncate pl-4 text-sm text-ash">
                      {href.replace(/^mailto:|^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      <Reveal delay={0.08}>
        <ContactForm />
      </Reveal>
    </div>
  );
}
