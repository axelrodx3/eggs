"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SocialLinks } from "@/components/navigation/SocialLinks";
import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/utils";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteNavigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = ["hero", ...siteConfig.nav.map((item) => item.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
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
      className={cn(
        "focus-ring rounded-md px-2 py-2 text-sm transition",
        activeSection === id
          ? "text-lime"
          : "text-foreground/75 hover:text-lime",
      )}
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
      <div className="section-shell flex h-16 items-center justify-between gap-3">
        <button
          type="button"
          className="focus-ring shrink-0 rounded-md"
          onClick={() => scrollToSection("hero")}
          aria-label={`${siteConfig.name} home`}
        >
          <Image
            src={siteConfig.brandAssets.wordmark}
            alt={siteConfig.name}
            width={132}
            height={40}
            priority
            className="h-8 w-auto max-w-[7.5rem] object-contain sm:h-9 sm:max-w-[8.5rem]"
          />
        </button>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {siteConfig.nav.map((item) => navItem(item.id, item.label))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <SocialLinks />
          <a
            href={siteConfig.robinhoodUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring ml-1 shrink-0 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-black transition hover:bg-lime-dim"
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
                className={cn(
                  "focus-ring rounded-xl border px-4 py-4 text-left text-lg",
                  activeSection === item.id
                    ? "border-lime/50 text-lime"
                    : "border-border",
                )}
                onClick={() => {
                  scrollToSection(item.id);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-auto space-y-4">
              <SocialLinks className="justify-center" />
              <a
                href={siteConfig.robinhoodUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring block rounded-full bg-lime px-4 py-4 text-center text-base font-semibold text-black"
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
