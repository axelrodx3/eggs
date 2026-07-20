"use client";

import Image from "next/image";
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
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-surface-elevated/80",
        containerClassName,
      )}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span className="px-1 text-center text-[10px] font-semibold leading-none text-foreground/80">
          {label}
        </span>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          unoptimized={src.endsWith(".svg")}
          className={cn("h-auto w-auto max-h-[82%] max-w-[82%] object-contain", className)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
