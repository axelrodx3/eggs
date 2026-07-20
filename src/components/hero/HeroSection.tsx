"use client";

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
      className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(199,240,0,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(199,240,0,0.08),transparent_35%)]"
      />
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="section-kicker">{siteConfig.eyebrow}</p>
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {siteConfig.headlineLine1}
            <span className="block text-lime">{siteConfig.headlineLine2}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foreground/75">
            {siteConfig.heroCopy}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={siteConfig.robinhoodUrl}
              target="_blank"
              rel="noreferrer"
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
          <p className="mt-6 text-sm font-medium text-lime/90">
            {siteConfig.availability}
          </p>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted">
            {siteConfig.disclaimer}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <BasketVisual priority floating tilt />
        </motion.div>
      </div>
    </section>
  );
}
