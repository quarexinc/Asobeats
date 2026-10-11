import { getSettings } from "@/lib/db";
import { IntroProvider } from "@/components/Intro";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import PlayerBar from "@/components/player/PlayerBar";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <PlayerProvider>
      <IntroProvider>
        <SmoothScroll />
        <Navbar />
        <main className="relative">{children}</main>
        <Footer settings={settings} />
        <PlayerBar />
      </IntroProvider>
    </PlayerProvider>
  );
}
