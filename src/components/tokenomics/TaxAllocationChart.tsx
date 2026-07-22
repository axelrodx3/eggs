"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  TAX_ALLOCATION_ROWS,
  TOKENOMICS,
  type TaxAllocationKey,
} from "@/data/tokenomics";
import { cn } from "@/lib/utils";

const RADIUS = 54;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TaxAllocationChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reducedMotion = useReducedMotion();
  const showRing = reducedMotion ? true : inView;

  const ariaLabel = TAX_ALLOCATION_ROWS.map(
    ({ key, label }) =>
      `${label}: ${TOKENOMICS.allocation[key as TaxAllocationKey]} percent`,
  ).join(". ");

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 lg:items-start">
      <div className="relative mx-auto flex items-center justify-center">
        <div
          role="img"
          aria-label={`Tax allocation chart. ${ariaLabel}.`}
          className="relative h-44 w-44 sm:h-48 sm:w-48"
        >
          <svg
            viewBox="0 0 128 128"
            className="h-full w-full"
            aria-hidden
          >
            <circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              className="text-border"
            />
            <motion.circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke="var(--eggs-lime)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              transform="rotate(-90 64 64)"
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{
                strokeDashoffset: showRing ? 0 : CIRCUMFERENCE,
              }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 1, ease: "easeOut" }
              }
              style={{
                strokeDasharray: CIRCUMFERENCE,
              }}
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-3xl font-semibold tracking-tight text-lime sm:text-4xl">
              {TOKENOMICS.allocation.stocks}%
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Tax Allocation
            </p>
            <p className="mt-0.5 text-sm text-foreground/85">Stocks Vault</p>
          </div>
        </div>
      </div>

      <ul className="w-full max-w-sm space-y-2" aria-label="Tax allocation breakdown">
        {TAX_ALLOCATION_ROWS.map(({ key, label }) => {
          const value = TOKENOMICS.allocation[key];
          const primary = value > 0;
          return (
            <li
              key={key}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2 text-sm",
                primary
                  ? "border-lime/30 bg-lime/5 text-foreground"
                  : "border-border/70 bg-black/20 text-muted",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    primary ? "bg-lime" : "bg-border",
                  )}
                />
                {label}
              </span>
              <span className={cn("font-medium", primary && "text-lime")}>
                {value}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
