import Link from "next/link";
import { formatToman } from "@/lib/format";
import { minVariantPrice } from "@/lib/catalog";
import { SpotlightCard } from "@/components/effects/SpotlightCard";

export function ProductCard({
  product,
}: {
  product: { slug: string; title: string; images: string[]; variants: { price: number }[] };
}) {
  return (
    <SpotlightCard>
      <Link
        href={`/products/${product.slug}`}
        className="hover-lift group block overflow-hidden rounded-2xl border border-border bg-surface transition"
      >
        <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium">{product.title}</h3>
          <div className="font-bold text-primary">{formatToman(minVariantPrice(product.variants))}</div>
        </div>
      </Link>
    </SpotlightCard>
  );
}
