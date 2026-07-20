"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import { BASKET_IMAGE } from "@/data/assets";
import { cn } from "@/lib/utils";

type BasketVisualProps = {
  className?: string;
  priority?: boolean;
  floating?: boolean;
  tilt?: boolean;
  variant?: "hero" | "inspector";
  resetKey?: number;
  children?: React.ReactNode;
};

export function BasketVisual({
  className,
  priority = false,
  floating = true,
  tilt = true,
  variant = "hero",
  resetKey = 0,
  children,
}: BasketVisualProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [4, -4]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 180,
    damping: 24,
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [resetKey, pointerX, pointerY]);

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

  const sizeClass =
    variant === "hero"
      ? "w-full max-w-[min(100%,42rem)] lg:max-w-[min(100%,48rem)]"
      : "w-full max-w-none";

  return (
    <div
      className={cn("relative perspective-[1200px]", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -z-10 rounded-full bg-[radial-gradient(circle,var(--glow-strong),transparent_68%)] blur-3xl",
          variant === "hero" ? "inset-[4%]" : "inset-[2%]",
        )}
      />
      <motion.div
        className={cn("relative mx-auto", sizeClass)}
        style={
          tilt && !reducedMotion
            ? { rotateX, rotateY, transformStyle: "preserve-3d" }
            : undefined
        }
        animate={
          floating && !reducedMotion ? { y: [0, -8, 0] } : undefined
        }
        transition={
          floating && !reducedMotion
            ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        <div
          className="relative w-full"
          style={{ aspectRatio: BASKET_IMAGE.aspectRatio }}
        >
          <Image
            src={BASKET_IMAGE.src}
            alt="$EGGS basket containing ten market-themed eggs"
            width={BASKET_IMAGE.width}
            height={BASKET_IMAGE.height}
            priority={priority}
            sizes={
              variant === "hero"
                ? "(max-width: 1024px) 100vw, 48rem"
                : "(max-width: 1024px) 100vw, 36rem"
            }
            className="relative z-10 h-full w-full select-none object-contain"
            draggable={false}
          />
          {children}
        </div>
        {floating ? (
          <motion.div
            aria-hidden
            className="absolute bottom-[2%] left-1/2 h-6 w-[50%] -translate-x-1/2 rounded-[100%] bg-black/60 blur-2xl sm:h-8 sm:w-[55%]"
            animate={
              !reducedMotion
                ? { opacity: [0.3, 0.5, 0.3], scaleX: [0.94, 1.04, 0.94] }
                : undefined
            }
            transition={
              !reducedMotion
                ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          />
        ) : null}
      </motion.div>
    </div>
  );
}
