"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { BasketVisual } from "@/components/basket/BasketVisual";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,var(--glow),transparent_42%),radial-gradient(circle_at_82%_8%,rgba(199,240,0,0.08),transparent_36%)]"
      />
      <div className="section-shell grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <motion.div
          className="order-2 lg:order-1"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="section-kicker">{siteConfig.eyebrow}</p>
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {siteConfig.headlineLine1}
            <span className="block text-lime">{siteConfig.headlineLine2}</span>
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={siteConfig.robinhoodUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center rounded-full bg-lime px-6 py-3 text-sm font-semibold text-black transition hover:bg-lime-dim"
            >
              Buy $EGGS
            </a>
            <button
              type="button"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-lime/50 hover:text-lime"
              onClick={() => scrollToSection("basket")}
            >
              Explore the Basket
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <a
            href={siteConfig.robinhoodUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-lime/90 transition hover:text-lime"
            aria-label={`${siteConfig.availability} on Robinhood`}
          >
            <span>{siteConfig.availability}</span>
            <Image
              src={siteConfig.socialAssets.robinhood}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 object-contain"
              aria-hidden
            />
          </a>
        </motion.div>

        <motion.div
          className="order-1 flex justify-center lg:order-2 lg:justify-end"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <BasketVisual priority floating tilt variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
