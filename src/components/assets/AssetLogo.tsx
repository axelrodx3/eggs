"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type AssetLogoProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  containerClassName?: string;
  fallbackText?: string;
};

export function AssetLogo({
  src,
  alt,
  size = 32,
  className,
  containerClassName,
  fallbackText,
}: AssetLogoProps) {
  const [failed, setFailed] = useState(false);
  const label = fallbackText ?? alt.slice(0, 3).toUpperCase();

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-white",
        containerClassName,
      )}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span className="px-1 text-center text-[10px] font-semibold leading-none text-black/80">
          {label}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          className={cn(
            "block h-[78%] w-[78%] max-h-[78%] max-w-[78%] object-contain",
            className,
          )}
          onError={() => setFailed(true)}
          draggable={false}
        />
      )}
    </div>
  );
}
