"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/utils";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteNavigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navItem = (id: string, label: string) => (
    <button
      key={id}
      type="button"
      className="focus-ring rounded-md px-2 py-2 text-sm text-foreground/80 transition hover:text-lime"
      onClick={() => {
        scrollToSection(id);
        setOpen(false);
      }}
    >
      {label}
    </button>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors",
        scrolled
          ? "border-border/80 bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="section-shell flex h-16 items-center justify-between gap-4">
        <button
          type="button"
          className="focus-ring rounded-md text-lg font-semibold tracking-tight"
          onClick={() => scrollToSection("hero")}
          aria-label={`${siteConfig.name} home`}
        >
          {siteConfig.name}
        </button>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {siteConfig.nav.map((item) => navItem(item.id, item.label))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={siteConfig.social.x}
            target="_blank"
            rel="noreferrer"
            className="focus-ring rounded-md px-2 py-2 text-sm text-muted transition hover:text-lime"
            aria-label="X"
          >
            X
          </a>
          <a
            href={siteConfig.social.telegram}
            target="_blank"
            rel="noreferrer"
            className="focus-ring rounded-md px-2 py-2 text-sm text-muted transition hover:text-lime"
            aria-label="Telegram"
          >
            TG
          </a>
          <a
            href={siteConfig.robinhoodUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring rounded-full bg-lime px-4 py-2 text-sm font-semibold text-black transition hover:bg-lime-dim"
          >
            Buy $EGGS
          </a>
        </div>

        <button
          type="button"
          className="focus-ring rounded-md p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-xl lg:hidden"
        >
          <div className="section-shell flex h-[calc(100vh-4rem)] flex-col gap-2 py-6">
            {siteConfig.nav.map((item) => (
              <button
                key={item.id}
                type="button"
                className="focus-ring rounded-xl border border-border px-4 py-4 text-left text-lg"
                onClick={() => {
                  scrollToSection(item.id);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-auto grid gap-3">
              <a
                href={siteConfig.social.x}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-xl border border-border px-4 py-3 text-center"
              >
                X
              </a>
              <a
                href={siteConfig.robinhoodUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-full bg-lime px-4 py-4 text-center text-base font-semibold text-black"
              >
                Buy $EGGS
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
