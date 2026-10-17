export function Marquee({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={`group overflow-hidden ${className ?? ""}`}>
      <div className="flex w-max animate-marquee gap-10 py-3 group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-bold">
            <span className="text-base">🐾</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
