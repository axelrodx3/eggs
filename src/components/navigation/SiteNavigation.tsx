"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const firstFocusable = mobileMenuRef.current?.querySelector<HTMLElement>(
      "button, a[href]",
    );
    firstFocusable?.focus();
    const menuButton = menuButtonRef.current;

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const navItem = (id: string, label: string) => (
    <button
      key={id}
      type="button"
      className={cn(
        "focus-ring rounded-md px-2 py-2 text-sm transition duration-200 ease-out",
        activeSection === id
          ? "text-lime"
          : "text-foreground/75 hover:text-lime",
      )}
      onClick={() => {
        scrollToSection(id);
        closeMenu();
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-colors",
          scrolled || open
            ? "border-border/80 bg-background backdrop-blur-xl"
            : "border-transparent bg-background/95 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none",
          open && "lg:border-transparent lg:bg-transparent",
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
              className="h-9 w-auto max-w-[8.5rem] object-contain sm:h-10 sm:max-w-[9.75rem]"
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
              className="focus-ring ml-1 shrink-0 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-black transition duration-200 ease-out hover:bg-lime-dim"
            >
              Buy $EGGS
            </a>
          </div>

          <button
            ref={menuButtonRef}
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
      </header>

      {open ? (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-x-0 bottom-0 z-[100] overflow-y-auto bg-background lg:hidden"
          style={{ top: "var(--site-header-offset)" }}
        >
          <div className="section-shell flex flex-col gap-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {siteConfig.nav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "focus-ring min-h-11 rounded-xl border px-4 py-3 text-left text-base font-medium transition duration-200 ease-out",
                  activeSection === item.id
                    ? "border-lime/50 text-lime"
                    : "border-border text-foreground/90",
                )}
                onClick={() => {
                  scrollToSection(item.id);
                  closeMenu();
                }}
              >
                {item.label}
              </button>
            ))}

            <div className="mt-4 space-y-4 border-t border-border pt-4">
              <SocialLinks className="justify-center" />
              <a
                href={siteConfig.robinhoodUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring block min-h-11 rounded-full bg-lime px-4 py-3 text-center text-base font-semibold text-black"
              >
                Buy $EGGS
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
