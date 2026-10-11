import Link from "next/link";
import type { Settings } from "@/lib/types";
import { InstagramIcon, MailIcon, SpotifyIcon, WhatsappIcon, YoutubeIcon } from "./icons";

export function socialLinks(s: Settings) {
  const wa = s.whatsapp.replace(/[^\d]/g, "");
  return [
    s.instagram && { href: s.instagram, label: "Instagram", Icon: InstagramIcon },
    s.youtube && { href: s.youtube, label: "YouTube", Icon: YoutubeIcon },
    s.spotify && { href: s.spotify, label: "Spotify", Icon: SpotifyIcon },
    wa && { href: `https://wa.me/${wa}`, label: "WhatsApp", Icon: WhatsappIcon },
    s.contactEmail && { href: `mailto:${s.contactEmail}`, label: "E-posta", Icon: MailIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof MailIcon }[];
}

export default function Footer({ settings }: { settings: Settings }) {
  const socials = socialLinks(settings);
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line pb-36 pt-16 sm:pb-40">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-8">
        <div>
          <p className="max-w-xs text-sm leading-relaxed text-ash">
            Kayda hazır beatler. Demoyu dinle, satın al, dosyan saniyeler içinde sipariş sayfanda.
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-fog transition-colors hover:border-bone hover:text-bone"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="mb-4 text-sm text-bone">Sayfalar</p>
          <ul className="space-y-2.5 text-sm text-ash">
            <li><Link className="hover:text-bone" href="/#beatler">Beatler</Link></li>
            <li><Link className="hover:text-bone" href="/hakkimda">Hakkımda</Link></li>
            <li><Link className="hover:text-bone" href="/sss">Sık sorulan sorular</Link></li>
            <li><Link className="hover:text-bone" href="/iletisim">Bana ulaş</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm text-bone">İletişim</p>
          <ul className="space-y-2.5 text-sm text-ash">
            {settings.contactEmail && (
              <li>
                <a className="break-all hover:text-bone" href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>
              </li>
            )}
            <li><Link className="hover:text-bone" href="/iletisim">İletişim formu</Link></li>
          </ul>
        </div>
      </div>

      <div className="pointer-events-none mx-auto mt-20 max-w-[1400px] select-none px-3" aria-hidden>
        <p className="font-wide text-center text-[16.5vw] font-black leading-[0.8] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_#2c2c2c] xl:text-[230px]">
          ASO BEATS
        </p>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-col justify-between gap-2 px-5 text-xs text-[#5f5f5f] sm:flex-row sm:px-8">
        <span>© {new Date().getFullYear()} Aso Beats. Tüm hakları saklıdır.</span>
        <span>Tüm beatler Aso tarafından üretilmiştir.</span>
      </div>
    </footer>
  );
}
