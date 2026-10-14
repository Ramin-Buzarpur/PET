export function WaveDivider({ color = "var(--color-surface-muted)", flip = false }: { color?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      className={`h-10 w-full ${flip ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        d="M0,30 C150,60 300,0 450,30 C600,60 750,0 900,30 C1050,60 1150,40 1200,30 L1200,60 L0,60 Z"
        fill={color}
      />
    </svg>
  );
}
