import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-start justify-center px-5 pt-32 sm:px-8">
      <p className="font-wide text-[28vw] font-black leading-[0.8] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_#3a3a3a] sm:text-[16vw]">
        404
      </p>
      <h1 className="mt-6 text-2xl font-semibold">Bu sayfa sessiz.</h1>
      <p className="mt-2 text-ash">Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.</p>
      <Link href="/" className="mt-8 rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
