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
  interactive?: boolean;
  children?: React.ReactNode;
};

export function BasketVisual({
  className,
  priority = false,
  floating = true,
  tilt = true,
  variant = "hero",
  interactive = false,
  children,
}: BasketVisualProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionActive, setMotionActive] = useState(true);
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
    const syncMotion = () => {
      setReducedMotion(media.matches);
      setMotionActive(!media.matches && document.visibilityState === "visible");
    };

    syncMotion();
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);

    return () => {
      media.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
    };
  }, []);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!tilt || reducedMotion || interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const heroIdleMotion =
    floating && variant === "hero" && motionActive && !reducedMotion;

  const sizeClass =
    variant === "hero"
      ? "w-full max-w-[min(100%,44.5rem)] lg:max-w-[min(100%,51.5rem)]"
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
        className={cn("relative mx-auto will-change-transform", sizeClass)}
        style={
          tilt && !reducedMotion && !interactive
            ? { rotateX, rotateY, transformStyle: "preserve-3d" }
            : undefined
        }
        animate={
          heroIdleMotion
            ? {
                y: [0, -5, 0],
                rotateZ: [0, 0.7, 0, -0.7, 0],
              }
            : undefined
        }
        transition={
          heroIdleMotion
            ? { duration: 9.5, repeat: Infinity, ease: "easeInOut" }
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
                ? "(max-width: 1024px) 100vw, 51.5rem"
                : "(max-width: 1024px) 100vw, 42rem"
            }
            className="pointer-events-none relative z-0 h-full w-full select-none object-contain"
            draggable={false}
          />
          {children ? (
            <div className="absolute inset-0 z-20" aria-hidden={false}>
              {children}
            </div>
          ) : null}
        </div>
        {floating && variant === "hero" ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-[2%] left-1/2 z-0 h-6 w-[50%] -translate-x-1/2 rounded-[100%] bg-black/60 blur-2xl sm:h-8 sm:w-[55%]"
            animate={
              heroIdleMotion
                ? { opacity: [0.28, 0.42, 0.28], scaleX: [0.96, 1.03, 0.96] }
                : undefined
            }
            transition={
              heroIdleMotion
                ? { duration: 9.5, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          />
        ) : null}
      </motion.div>
    </div>
  );
}
