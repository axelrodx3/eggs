"use client";

import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/utils";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M21.94 4.66c.24 1.02-.6 1.45-1.32 1.67l-14.9 5.73c-1.58.58-1.56 1.52-.27 1.92l3.82 1.2 1.45 4.42c.17.47.31.65.8.65.51 0 .74-.23 1.02-.51l2.45-2.38 5.08 3.74c.93.51 1.6.25 1.83-.86l3.01-14.16c.34-1.36-.5-1.98-1.41-1.63zM8.76 14.34l9.96-6.26c.44-.28.84-.13.51.17l-8.08 7.33-.29 2.79-2.1-4.03z" />
    </svg>
  );
}

function DexscreenerIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={siteConfig.socialAssets.dexscreener}
      alt=""
      width={22}
      height={22}
      className={cn("block h-[22px] w-[22px] shrink-0 object-contain", className)}
      aria-hidden
      draggable={false}
    />
  );
}

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
  buttonClassName?: string;
  showLabels?: boolean;
};

type SocialItem = {
  id: string;
  label: string;
  ariaLabel: string;
  href: string | null;
  icon: React.ReactNode;
  disabledDim?: boolean;
};

export function SocialLinks({
  className,
  iconClassName = "h-[18px] w-[18px]",
  buttonClassName,
  showLabels = false,
}: SocialLinksProps) {
  const items: SocialItem[] = [
    {
      id: "x",
      label: "X",
      ariaLabel: "X",
      href: siteConfig.social.x,
      icon: <XIcon className={iconClassName} />,
    },
    {
      id: "telegram",
      label: "Telegram",
      ariaLabel: "Telegram",
      href: siteConfig.social.telegram,
      icon: <TelegramIcon className={iconClassName} />,
      disabledDim: true,
    },
    {
      id: "dexscreener",
      label: "Dexscreener",
      ariaLabel: "View $EGGS on DexScreener",
      href: siteConfig.social.dexscreener,
      icon: <DexscreenerIcon />,
    },
  ];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {items.map((item) => {
        const baseClass = cn(
          "focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-transparent transition hover:border-lime/30 hover:bg-lime/5 hover:shadow-[0_0_18px_rgba(199,240,0,0.12)]",
          buttonClassName,
        );

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(baseClass, "text-muted hover:text-lime")}
              aria-label={item.ariaLabel}
              title={item.label}
            >
              {item.icon}
              {showLabels ? (
                <span className="ml-2 text-sm">{item.label}</span>
              ) : null}
            </a>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              baseClass,
              "cursor-not-allowed",
              item.disabledDim ? "text-muted/45" : "opacity-100",
            )}
            aria-label={item.ariaLabel}
            title={item.label}
            disabled
          >
            {item.icon}
            {showLabels ? (
              <span className="ml-2 text-sm">{item.label}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
