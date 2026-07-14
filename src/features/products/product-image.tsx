"use client";

import { useState } from "react";
import { PackageIcon } from "@/components/icon/icons";
import { cn } from "@/lib/utils/cn";
import type { ProductImage as ProductImageData } from "./product.types";

type ProductImageProps = {
  alt: string;
  className?: string;
  image?: ProductImageData | null;
};

export function ProductImage({ alt, className, image }: ProductImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const url = image?.url;
  const failed = Boolean(url && failedUrl === url);
  const loaded = Boolean(url && loadedUrl === url && !failed);

  return (
    <span
      aria-label={failed ? `${alt} โหลดไม่สำเร็จ` : alt}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden bg-blue-50 text-blue-500",
        className,
      )}
      role="img"
    >
      {!loaded ? <PackageIcon aria-hidden="true" className="size-1/2 max-h-8 max-w-8" /> : null}
      {url && !failed ? (
        // Backend image URLs can use different storage hosts, so this stateful fallback intentionally uses a native image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className={cn("absolute inset-0 size-full object-contain transition-opacity", loaded ? "opacity-100" : "opacity-0")}
          onError={() => setFailedUrl(url)}
          onLoad={() => setLoadedUrl(url)}
          src={url}
        />
      ) : null}
    </span>
  );
}
