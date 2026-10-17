export function FieldNoteBadge({
  children,
  className,
  rotate = "-3deg",
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
}) {
  return (
    <span
      className={`field-note-badge inline-flex items-center gap-1.5 rounded-lg border border-border bg-highlight/30 px-2.5 py-1 text-xs font-bold text-highlight-foreground ${className ?? ""}`}
      style={{ "--note-rotate": rotate } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
