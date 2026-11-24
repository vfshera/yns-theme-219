import type { ImgHTMLAttributes } from "react";
import { cn, isVideoUrl } from "~/lib/utils";

type YnsMediaProps = {
  src: string;
  alt: string;
  /** Position the media absolutely inside its nearest positioned parent. */
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
  autoPlay?: boolean;
  controls?: boolean;
};

/**
 * Renders a <video> for video URLs, otherwise a plain <img> for static assets
 * served from public/ (e.g. /images/pexels/...). This is the single seam that
 * replaces Next.js's Image/getImageProps in the source theme.
 */
export function YnsMedia({
  src,
  alt,
  fill = false,
  sizes,
  className,
  priority = false,
  fetchPriority,
  autoPlay = true,
  controls = false,
}: YnsMediaProps) {
  const fillClasses = fill && "absolute inset-0 h-full w-full";

  if (isVideoUrl(src)) {
    return (
      <video
        // Videos have no alt attribute — surface the image alt text to assistive tech instead.
        aria-label={alt || undefined}
        className={cn(fillClasses, "object-cover", className)}
        src={src}
        muted
        loop
        autoPlay={autoPlay}
        playsInline
        controls={controls}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      className={cn(fillClasses, className)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={fetchPriority ?? (priority ? "high" : undefined)}
    />
  );
}
