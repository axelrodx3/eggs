"use client";

import { tokenomicsConfig } from "@/data/tokenomics";

export function TokenomicsSection() {
  const { finalized, categories } = tokenomicsConfig;
  const hasPercentages = categories.some(
    (category) => category.percentage !== null,
  );

  return (
    <section id="tokenomics" className="scroll-mt-24 py-16 sm:py-24">
      <div className="section-shell">
        <p className="section-kicker">Distribution</p>
        <h2 className="section-title">Tokenomics</h2>

        {!finalized || !hasPercentages ? (
          <div className="mt-8 rounded-3xl border border-border bg-surface p-8">
            <p className="text-lg font-medium">Distribution details coming soon.</p>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Percentages will render from{" "}
              <code className="text-lime">src/data/tokenomics.ts</code> once
              finalized. No placeholder percentages are shown on the public page.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-2xl border border-border bg-black/20 p-4"
                >
                  <p className="font-medium">{category.name}</p>
                  <p className="mt-1 text-sm text-muted">{category.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex h-4 overflow-hidden rounded-full border border-border">
              {categories.map((category) => (
                <div
                  key={category.id}
                  style={{ width: `${category.percentage ?? 0}%` }}
                  className="h-full bg-lime/80 first:rounded-l-full last:rounded-r-full"
                  title={category.name}
                />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <article
                  key={category.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <p className="text-2xl font-semibold text-lime">
                    {category.percentage}%
                  </p>
                  <p className="font-medium">{category.name}</p>
                  <p className="mt-1 text-sm text-muted">{category.description}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
