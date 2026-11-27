import { useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "~/components/ui/button";
import { YnsMedia } from "~/components/YnsMedia";
import { cn, isVideoUrl } from "~/lib/utils";

/**
 * The source theme's media gallery: a thumbnail strip, wrap-around arrows, keyboard
 * arrows, click/button zoom and video support. The full image list is never filtered on
 * variant selection — the selected variant's first photo only decides the active thumb.
 */
export function ProductGallery({
  images,
  productName,
  selectedVariantId = null,
  selectedImage = null,
}: {
  images: string[];
  productName: string;
  selectedVariantId?: string | null;
  /** The selected variant's first image, used to jump the gallery during render. */
  selectedImage?: string | null;
}) {
  const variantImageIndex = selectedImage ? images.indexOf(selectedImage) : -1;
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.max(variantImageIndex, 0),
  );
  const [isZoomed, setIsZoomed] = useState(false);

  // Mirror the source's render-time comparison: a variant change jumps the gallery without an effect.
  const [lastVariantId, setLastVariantId] = useState(selectedVariantId);
  if (lastVariantId !== selectedVariantId) {
    setLastVariantId(selectedVariantId);
    if (variantImageIndex >= 0) {
      setSelectedIndex(variantImageIndex);
    }

    setIsZoomed(false);
  }

  const image = images[selectedIndex];
  const isVideo = image ? isVideoUrl(image) : false;
  const canNavigate = images.length > 1;

  const select = (index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  };

  const previous = () =>
    select(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  const next = () =>
    select(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!canNavigate) {
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Product media gallery"
      onKeyDown={onKeyDown}
      className="flex w-full min-w-0 flex-1 flex-col-reverse gap-4 outline-none lg:sticky lg:top-36 lg:h-[620px] lg:flex-row lg:items-start"
    >
      {canNavigate && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:w-[60px] lg:shrink-0 lg:grid-cols-1 lg:gap-4 lg:overflow-visible lg:pb-0">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-current={selectedIndex === index}
              onClick={() => select(index)}
              className={cn(
                "relative aspect-square w-[60px] shrink-0 overflow-hidden border bg-secondary transition-all hover:brightness-75",
                selectedIndex === index
                  ? "border-primary brightness-75"
                  : "border-border/40",
              )}
            >
              <YnsMedia
                src={src}
                alt=""
                fill
                sizes="60px"
                className={cn(
                  "object-cover",
                  isVideoUrl(src) && "object-contain",
                )}
                autoPlay={false}
              />
            </button>
          ))}
        </div>
      )}

      <div className="group relative aspect-square w-full overflow-hidden bg-secondary lg:aspect-auto lg:size-full lg:flex-1">
        {image ? (
          <>
            <YnsMedia
              src={image}
              alt={productName}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className={cn(
                "object-cover object-center transition-transform duration-500 lg:object-contain lg:mix-blend-multiply lg:brightness-110 lg:contrast-[1.06] lg:[mask-image:radial-gradient(circle_closest-side,#000_80%,transparent)]",
                isZoomed && "scale-150 cursor-zoom-out",
                isVideo && "object-contain",
              )}
              controls={isVideo}
              priority={selectedIndex === 0}
              fetchPriority={selectedIndex === 0 ? "high" : undefined}
            />
            {!isVideo && (
              <button
                type="button"
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                aria-pressed={isZoomed}
                onClick={() => setIsZoomed((zoomed) => !zoomed)}
                className="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full bg-background text-primary shadow-md transition-colors hover:bg-primary hover:text-background"
              >
                <ZoomIn aria-hidden="true" className="size-5" />
              </button>
            )}
            {canNavigate && !isVideo && (
              <div className="absolute inset-x-4 bottom-4 flex justify-between lg:hidden">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label="Previous image"
                  onClick={previous}
                  className="size-10 rounded-full bg-background shadow-md hover:bg-background"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label="Next image"
                  onClick={next}
                  className="size-10 rounded-full bg-background shadow-md hover:bg-background"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="flex h-full items-center justify-center text-muted-foreground">
            No images available
          </p>
        )}
      </div>
    </section>
  );
}
