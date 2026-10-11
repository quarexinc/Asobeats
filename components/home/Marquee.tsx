export default function Marquee({ words }: { words: string[] }) {
  const items = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-line py-5" aria-hidden>
      <div className="marquee flex w-max items-center">
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center">
            {items.map((w, i) => (
              <span key={i} className="flex items-center">
                <span className="font-wide px-7 text-2xl font-black tracking-[-0.03em] text-[#3d3d3d] sm:text-4xl">{w}</span>
                <svg width="22" height="18" viewBox="0 0 22 18" className="text-[#555]">
                  {[6, 14, 18, 10, 4].map((h, j) => (
                    <rect key={j} x={j * 4.5} y={(18 - h) / 2} width="2.2" height={h} rx="1.1" fill="currentColor" />
                  ))}
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
