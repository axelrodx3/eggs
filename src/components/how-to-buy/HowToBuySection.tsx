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
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="glass-panel relative overflow-hidden p-6"
            >
              <div className="absolute right-4 top-4 text-5xl font-semibold text-white/5">
                {index + 1}
              </div>
              <div className="mb-4 inline-flex rounded-2xl border border-border bg-black/30 p-3 text-lime">
                <step.icon className="h-6 w-6" />
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
            rel="noreferrer"
            className="focus-ring inline-flex rounded-full bg-lime px-6 py-3 text-sm font-semibold text-black transition hover:bg-lime-dim"
          >
            Buy $EGGS on Robinhood
          </a>
        </div>
      </div>
    </section>
  );
}
