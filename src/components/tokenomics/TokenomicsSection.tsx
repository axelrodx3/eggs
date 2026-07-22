"use client";

import { motion } from "framer-motion";
import { ArrowLeftRight, Landmark, Users } from "lucide-react";
import { TaxAllocationChart } from "@/components/tokenomics/TaxAllocationChart";
import { formatEggsBalance, TOKENOMICS } from "@/data/tokenomics";

const rewardFlowSteps = [
  {
    title: "Trade",
    description: "Buy and sell activity generates protocol tax.",
    icon: ArrowLeftRight,
  },
  {
    title: "Stocks Vault",
    description:
      "100% of collected tax is routed to Flap’s Stocks Vault.",
    icon: Landmark,
  },
  {
    title: "Eligible Holders",
    description:
      "The Stocks Vault manages basket based rewards for qualifying holders.",
    icon: Users,
  },
];

function TaxRateCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <article className="glass-panel flex flex-col p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-5xl font-semibold tracking-tight text-lime sm:text-6xl">
        {value}%
      </p>
      <div
        aria-hidden
        className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border"
      >
        <motion.div
          className="h-full rounded-full bg-lime/80"
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(value * 10, 100)}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground/75">
        {description}
      </p>
    </article>
  );
}

export function TokenomicsSection() {
  const minimumBalance = formatEggsBalance(TOKENOMICS.minimumEligibleBalance);

  return (
    <section id="tokenomics" className="scroll-mt-24 py-16 sm:py-24">
      <div className="section-shell">
        <p className="section-kicker">Tokenomics</p>
        <h2 className="section-title max-w-3xl">Every Tax Builds the Basket.</h2>
        <p className="mt-4 max-w-3xl text-foreground/75">
          A portion of every $EGGS trade is routed through Flap’s Stocks Vault to
          support basket-based rewards for eligible holders. Nothing here
          guarantees profits, fixed returns, legal dividends, or direct ownership
          of the underlying public companies.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <TaxRateCard
            label="Buy Tax"
            value={TOKENOMICS.buyTaxPercent}
            description={`${TOKENOMICS.buyTaxPercent}% of each eligible buy is collected by the protocol.`}
          />
          <TaxRateCard
            label="Sell Tax"
            value={TOKENOMICS.sellTaxPercent}
            description={`${TOKENOMICS.sellTaxPercent}% of each eligible sell is collected by the protocol.`}
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          <TaxAllocationChart />
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">
              Where the collected tax goes
            </h3>
            <p className="text-sm leading-relaxed text-foreground/75">
              “100% Stocks” means that all collected buy and sell tax is directed
              to Flap’s Stocks Vault. It does not mean that 100% of each token
              transaction is taken as tax.
            </p>
            <p className="text-sm leading-relaxed text-foreground/75">
              The full tax allocation is sent to the Stocks Vault, which uses those
              funds in connection with the project’s ten-asset basket. Basket
              holder rewards are handled externally through Flap’s existing Stocks
              Vault not through a separate custom $EGGS vault.
            </p>
            <p className="text-sm leading-relaxed text-foreground/75">
              The separate dividend tracker allocation remains at 0% because basket
              reward handling is managed through the Stocks Vault, even though
              Flap’s interface displays that field independently.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <article className="glass-panel p-6 sm:p-7">
            <h3 className="text-lg font-semibold">Holder Eligibility</h3>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-lime sm:text-5xl">
              {minimumBalance} $EGGS
            </p>
            <p className="mt-2 text-sm font-medium text-foreground/85">
              Minimum balance required for basket reward eligibility
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
              Wallets must maintain at least {minimumBalance} $EGGS to meet the
              configured holder eligibility threshold. This does not guarantee
              payouts, a payment schedule, stock ownership, or any specific
              reward value.
            </p>
            <p className="mt-3 text-xs text-muted">
              Configured through Flap’s Stocks Vault.
            </p>
          </article>

          <div>
            <h3 className="text-lg font-semibold">Reward flow</h3>
            <div className="relative mt-5 grid gap-4 sm:grid-cols-3">
              <div
                aria-hidden
                className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-lime/35 to-transparent sm:block"
              />
              {rewardFlowSteps.map((step) => (
                <article
                  key={step.title}
                  className="glass-panel flex min-h-[190px] flex-col p-5"
                >
                  <div className="mb-3 inline-flex w-fit rounded-2xl border border-border bg-black/30 p-3 text-lime">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h4 className="font-semibold">{step.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
