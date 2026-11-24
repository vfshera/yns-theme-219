import { YnsMedia } from "~/components/YnsMedia";

/**
 * The fixtures carry exactly one product image, so this is a single framed photo.
 * Deferred: thumbnail strip, zoom button, mobile arrows, keyboard nav and the
 * variant-linked image jump from the source theme.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const image = images[0];

  return (
    <section
      aria-label={`${productName} images`}
      className="flex w-full min-w-0 flex-1 flex-col lg:sticky lg:top-36"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary lg:aspect-auto lg:h-[620px]">
        {image ? (
          <YnsMedia
            src={image}
            alt={productName}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center transition-transform duration-500 lg:object-contain lg:mix-blend-multiply lg:brightness-110 lg:contrast-[1.06] lg:[mask-image:radial-gradient(circle_closest-side,#000_80%,transparent)]"
            priority
            fetchPriority="high"
          />
        ) : (
          <p className="flex h-full items-center justify-center text-muted-foreground">
            No images available
          </p>
        )}
      </div>
    </section>
  );
}
