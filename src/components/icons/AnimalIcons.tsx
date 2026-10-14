type IconProps = { className?: string };

export function CatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path d="M12 10L16 20H32L36 10L30 22.5C34 24.5 36.5 28.5 36.5 33C36.5 39 31 42 24 42C17 42 11.5 39 11.5 33C11.5 28.5 14 24.5 18 22.5L12 10Z" fill="currentColor" />
      <circle cx="19" cy="31" r="1.6" fill="var(--color-surface)" />
      <circle cx="29" cy="31" r="1.6" fill="var(--color-surface)" />
      <path d="M22 35c0.8 0.8 2.2 0.8 3 0" stroke="var(--color-surface)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function DogIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <ellipse cx="24" cy="28" rx="13" ry="12" fill="currentColor" />
      <path d="M12 16C8 14 6 18 8 23C10 21 13 19 15 19L12 16Z" fill="currentColor" />
      <path d="M36 16C40 14 42 18 40 23C38 21 35 19 33 19L36 16Z" fill="currentColor" />
      <ellipse cx="24" cy="32" rx="6" ry="4.5" fill="var(--color-surface)" />
      <circle cx="19" cy="25" r="1.6" fill="var(--color-surface)" />
      <circle cx="29" cy="25" r="1.6" fill="var(--color-surface)" />
      <ellipse cx="24" cy="31" rx="1.8" ry="1.4" fill="currentColor" />
    </svg>
  );
}

export function FeatherIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M34 8C22 10 14 20 12 34C12 36 13 38 15 38C29 36 39 28 41 16C41.5 13 39 7.5 34 8Z"
        fill="currentColor"
      />
      <path d="M15 38L27 15" stroke="var(--color-surface)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 31L25 24M20 27L26 20" stroke="var(--color-surface)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function RabbitIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <ellipse cx="17" cy="12" rx="4" ry="11" transform="rotate(-18 17 12)" fill="currentColor" />
      <ellipse cx="31" cy="12" rx="4" ry="11" transform="rotate(18 31 12)" fill="currentColor" />
      <circle cx="24" cy="30" r="13" fill="currentColor" />
      <circle cx="19" cy="28" r="1.6" fill="var(--color-surface)" />
      <circle cx="29" cy="28" r="1.6" fill="var(--color-surface)" />
      <path d="M21 34c1.6 1.4 4.4 1.4 6 0" stroke="var(--color-surface)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function FishIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M8 24C14 14 26 12 34 16C38 18 41 21 41 24C41 27 38 30 34 32C26 36 14 34 8 24Z"
        fill="currentColor"
      />
      <path d="M34 16L41 11V24L34 32" fill="currentColor" />
      <circle cx="18" cy="22" r="1.8" fill="var(--color-surface)" />
      <path d="M10 24c3 1.5 6 1.5 9 0" stroke="var(--color-surface)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function TurtleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <ellipse cx="24" cy="26" rx="15" ry="11" fill="currentColor" />
      <path
        d="M24 17V35M15 26H33M18 19L13 24M30 19L35 24M18 33L13 28M30 33L35 28"
        stroke="var(--color-surface)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M38 24C41 23 43 25 42 28C40 27 38 26 38 24Z" fill="currentColor" />
      <circle cx="40.5" cy="25.5" r="0.9" fill="var(--color-surface)" />
      <circle cx="9" cy="33" r="3" fill="currentColor" />
      <circle cx="39" cy="33" r="3" fill="currentColor" />
    </svg>
  );
}

export function HomeHeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path d="M8 22L24 9L40 22V39C40 40 39 41 38 41H10C9 41 8 40 8 39V22Z" fill="currentColor" />
      <path
        d="M24 32C21 29 18 27 18 24C18 22 20 21 21.5 22.5C22.5 23.5 24 25 24 25C24 25 25.5 23.5 26.5 22.5C28 21 30 22 30 24C30 27 27 29 24 32Z"
        fill="var(--color-surface)"
      />
    </svg>
  );
}

export const SECTION_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  cats: CatIcon,
  dogs: DogIcon,
  birds: FeatherIcon,
  "small-pets": RabbitIcon,
  aquarium: FishIcon,
  reptiles: TurtleIcon,
  "home-caretaker": HomeHeartIcon,
};
