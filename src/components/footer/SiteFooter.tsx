"use client";

import { Copy } from "lucide-react";
import { SocialLinks } from "@/components/navigation/SocialLinks";
import { siteConfig } from "@/data/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12">
      <div className="section-shell grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-2xl font-semibold">{siteConfig.name}</p>
          <p className="mt-2 text-lime">{siteConfig.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <SocialLinks />
            <a
              href={siteConfig.robinhoodUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring text-sm text-muted transition hover:text-lime"
            >
              Buy on Robinhood
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Contract address
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="text-sm text-foreground/80">Coming soon</code>
              <button
                type="button"
                disabled
                className="focus-ring inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted"
                aria-label="Copy contract address"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Memecoins are speculative and volatile. Nothing on this site is
            financial advice. Holding $EGGS does not automatically constitute
            ownership of displayed securities.
          </p>
          <p className="text-xs text-muted">© {year} $EGGS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
