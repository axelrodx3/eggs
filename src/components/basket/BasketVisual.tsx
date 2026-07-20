"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const BASKET_PATH = "/assets/eggs-basket.png";

function BasketPlaceholder() {
  return (
    <div
      className="flex aspect-[4/5] w-full max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-lime/30 bg-surface-elevated p-8 text-center"
      role="img"
      aria-label="Placeholder for the $EGGS basket artwork"
    >
      <div className="mb-4 rounded-full border border-lime/40 px-4 py-1 text-xs uppercase tracking-[0.2em] text-lime">
        Asset pending
      </div>
      <p className="text-lg font-medium">Insert final basket PNG</p>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Place the transparent high-resolution basket at{" "}
        <code className="text-lime">public/assets/eggs-basket.png</code>
      </p>
    </div>
  );
}

export function BasketVisual({
  className,
  priority = false,
  floating = true,
  tilt = true,
  children,
}: {
  className?: string;
  priority?: boolean;
  floating?: boolean;
  tilt?: boolean;
  children?: React.ReactNode;
}) {
  const [hasImage, setHasImage] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [6, -6]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 180,
    damping: 22,
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    fetch(BASKET_PATH, { method: "HEAD" })
      .then((response) => setHasImage(response.ok))
      .catch(() => setHasImage(false));
  }, []);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!tilt || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  if (hasImage === false) {
    return (
      <div className={cn("relative", className)}>
        <BasketPlaceholder />
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn("relative perspective-[1200px]", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(circle,rgba(199,240,0,0.22),transparent_65%)] blur-2xl"
      />
      <motion.div
        className="relative mx-auto w-full max-w-xl"
        style={
          tilt && !reducedMotion
            ? { rotateX, rotateY, transformStyle: "preserve-3d" }
            : undefined
        }
        animate={
          floating && !reducedMotion
            ? { y: [0, -10, 0] }
            : undefined
        }
        transition={
          floating && !reducedMotion
            ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        {hasImage ? (
          <Image
            src={BASKET_PATH}
            alt="$EGGS basket containing ten market-themed eggs"
            width={960}
            height={1200}
            priority={priority}
            className="relative z-10 h-auto w-full select-none"
            draggable={false}
          />
        ) : (
          <div className="aspect-[4/5] w-full animate-pulse rounded-3xl bg-surface-elevated" />
        )}
        <motion.div
          aria-hidden
          className="absolute bottom-[4%] left-1/2 h-8 w-[55%] -translate-x-1/2 rounded-[100%] bg-black/50 blur-xl"
          animate={
            floating && !reducedMotion
              ? { opacity: [0.35, 0.55, 0.35], scaleX: [0.95, 1.05, 0.95] }
              : undefined
          }
          transition={
            floating && !reducedMotion
              ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />
        {children}
      </motion.div>
    </div>
  );
}
