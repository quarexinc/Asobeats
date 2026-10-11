"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon, MenuIcon } from "./icons";
import { useIntroDone } from "./Intro";

const LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/#beatler", label: "Beatler" },
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "Bana Ulaş" },
];

export default function Navbar() {
  const pathname = usePathname();
  const introDone = useIntroDone();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={introDone ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border px-4 py-2.5 transition-[background-color,border-color,backdrop-filter] duration-500 sm:px-5 ${
            scrolled ? "border-line bg-black/70 backdrop-blur-xl" : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="font-wide text-[15px] font-black tracking-[-0.02em]" aria-label="Aso Beats ana sayfa">
            <span className="metal">ASO BEATS</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`relative isolate rounded-full px-4 py-2 text-sm transition-colors ${
                    active(l.href) ? "text-bone" : "text-ash hover:text-bone"
                  }`}
                >
                  {active(l.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-steel"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/#beatler"
            className="hidden rounded-full bg-bone px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.04] md:inline-block"
          >
            Beatleri dinle
          </Link>

          <button
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
            aria-label="Menüyü aç"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-black px-6 pb-10 pt-5 md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="font-wide text-[15px] font-black metal">ASO BEATS</span>
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Menüyü kapat">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-auto space-y-1">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`font-wide block py-1 text-[11vw] font-black leading-none tracking-[-0.03em] ${
                      active(l.href) ? "text-bone" : "text-[#4a4a4a]"
                    }`}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
