import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aso Beats · Beat Mağazası",
    template: "%s · Aso Beats",
  },
  description:
    "Aso Beats: trap, drill ve R&B beatleri. 15 saniyelik demoyu dinle, satın al, MP3 dosyan anında teslim edilsin.",
  openGraph: {
    title: "Aso Beats",
    description: "Kayda hazır beatler. Dinle, satın al, anında indir.",
    type: "website",
    locale: "tr_TR",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

const introScript = `try{if(sessionStorage.getItem('aso_intro_seen')==='1')document.documentElement.classList.add('intro-seen')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='black'/><g fill='%23e5e5e5'><rect x='14' y='26' width='5' height='12' rx='2.5'/><rect x='22' y='18' width='5' height='28' rx='2.5'/><rect x='30' y='12' width='5' height='40' rx='2.5'/><rect x='38' y='20' width='5' height='24' rx='2.5'/><rect x='46' y='28' width='5' height='8' rx='2.5'/></g></svg>"
        />
      </head>
      <body className="grain min-h-dvh">{children}</body>
    </html>
  );
}
