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
      <div className="section-shell grid items-center gap-8 lg:grid-cols-[1fr_1.08fr] lg:gap-10 xl:gap-11">
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
          <div className="mt-8 flex flex-wrap gap-4 sm:gap-5">
            <a
              href={siteConfig.robinhoodUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center rounded-full bg-lime px-6 py-3 text-sm font-semibold text-black transition duration-200 ease-out hover:bg-lime-dim"
            >
              Buy $EGGS
            </a>
            <button
              type="button"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition duration-200 ease-out hover:border-lime/50 hover:text-lime"
              onClick={() => scrollToSection("basket")}
            >
              Explore the Basket
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div
            className="mt-5 inline-flex min-h-11 cursor-default items-center gap-2.5"
            aria-label={`${siteConfig.availability} on Robinhood`}
          >
            <span className="text-sm font-medium text-lime/90">
              {siteConfig.availability}
            </span>
            <span className="inline-flex shrink-0 items-center opacity-100">
              <Image
                src={siteConfig.socialAssets.robinhood}
                alt=""
                width={22}
                height={28}
                aria-hidden
                className="h-[18px] w-auto object-contain opacity-100 sm:h-5 lg:h-[22px]"
              />
            </span>
          </div>
        </motion.div>

        <motion.div
          className="relative order-1 flex justify-center lg:order-2 lg:justify-center lg:-translate-x-3 xl:-translate-x-5"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
          >
            <div className="h-[min(90%,28rem)] w-[min(95%,34rem)] rounded-full bg-[radial-gradient(circle,rgba(199,240,0,0.12),transparent_72%)] blur-3xl" />
          </div>
          <BasketVisual priority floating tilt variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
