"use client";

import { Smartphone, Search, Wallet } from "lucide-react";
import { siteConfig } from "@/data/site-config";

const steps = [
  {
    title: "Open Robinhood",
    description: "Launch Robinhood on web or mobile when $EGGS is listed.",
    icon: Smartphone,
  },
  {
    title: "Search $EGGS",
    description: "Find the official $EGGS listing through Robinhood search.",
    icon: Search,
  },
  {
    title: "Buy and hold",
    description: "Review details carefully, then purchase through Robinhood.",
    icon: Wallet,
  },
];

export function HowToBuySection() {
  return (
    <section id="how-to-buy" className="scroll-mt-24 py-16 sm:py-24">
      <div className="section-shell">
        <p className="section-kicker">How to buy</p>
        <h2 className="section-title">Three steps to $EGGS</h2>
        <p className="mt-3 text-foreground/70">Three steps. One basket.</p>
        <div className="relative mt-10 grid gap-4 lg:grid-cols-3">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-lime/35 to-transparent lg:block"
          />
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="glass-panel relative flex min-h-[220px] flex-col p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex rounded-2xl border border-border bg-black/30 p-3 text-lime">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-3xl font-semibold text-lime/25">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                {step.description}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <a
            href={siteConfig.robinhoodUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex rounded-full bg-lime px-6 py-3 text-sm font-semibold text-black transition hover:bg-lime-dim"
          >
            Buy $EGGS on Robinhood
          </a>
        </div>
      </div>
    </section>
  );
}
