"use client";

import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/utils";

const socialIconFrameClass = "inline-flex h-5 w-5 shrink-0 items-center justify-center";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("block h-full w-full shrink-0", className)}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("block h-full w-full shrink-0", className)}
      fill="currentColor"
    >
      <path d="M9.417 15.181l-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.721.268 1.998-.931L23.93 3.821c.321-1.431-.541-1.951-1.448-1.626L1.114 9.941c-1.419.564-1.413 1.335-.26 1.684l5.408 1.692L19.03 5.885c.732-.445 1.393-.168.849.445" />
    </svg>
  );
}

function DexscreenerIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={siteConfig.socialAssets.dexscreener}
      alt=""
      width={20}
      height={20}
      className={cn("block h-full w-full shrink-0 object-contain", className)}
      aria-hidden
      draggable={false}
    />
  );
}

function SocialIconFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(socialIconFrameClass, className)}>{children}</span>
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
  iconClassName,
  buttonClassName,
  showLabels = false,
}: SocialLinksProps) {
  const frameClass = cn(socialIconFrameClass, iconClassName);

  const items: SocialItem[] = [
    {
      id: "x",
      label: "X",
      ariaLabel: "X",
      href: siteConfig.social.x,
      icon: (
        <SocialIconFrame className={frameClass}>
          <XIcon />
        </SocialIconFrame>
      ),
    },
    {
      id: "telegram",
      label: "Telegram",
      ariaLabel: "Telegram",
      href: siteConfig.social.telegram,
      icon: (
        <SocialIconFrame className={frameClass}>
          <TelegramIcon />
        </SocialIconFrame>
      ),
      disabledDim: true,
    },
    {
      id: "dexscreener",
      label: "Dexscreener",
      ariaLabel: "View $EGGS on DexScreener",
      href: siteConfig.social.dexscreener,
      icon: (
        <SocialIconFrame className={frameClass}>
          <DexscreenerIcon />
        </SocialIconFrame>
      ),
    },
  ];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {items.map((item) => {
        const baseClass = cn(
          "focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-transparent transition duration-200 ease-out hover:border-lime/30 hover:bg-lime/5 hover:shadow-[0_0_18px_rgba(199,240,0,0.12)]",
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
              "cursor-not-allowed text-muted/45",
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
