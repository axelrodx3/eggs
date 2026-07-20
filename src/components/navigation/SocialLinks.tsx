"use client";

import { LineChart, Send } from "lucide-react";
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

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
  buttonClassName?: string;
  showLabels?: boolean;
};

type SocialItem = {
  id: string;
  label: string;
  href: string | null;
  icon: React.ReactNode;
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
      href: siteConfig.social.x,
      icon: <XIcon className={iconClassName} />,
    },
    {
      id: "telegram",
      label: "Telegram",
      href: siteConfig.social.telegram,
      icon: <Send className={iconClassName} />,
    },
    {
      id: "dexscreener",
      label: "Dexscreener",
      href: siteConfig.social.dexscreener,
      icon: <LineChart className={iconClassName} />,
    },
  ];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {items.map((item) => {
        const baseClass = cn(
          "focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-transparent text-muted transition hover:border-lime/30 hover:bg-lime/5 hover:text-lime",
          buttonClassName,
        );

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={baseClass}
              aria-label={item.label}
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
            className={cn(baseClass, "cursor-not-allowed opacity-45")}
            aria-label={`${item.label} link coming soon`}
            title={`${item.label} coming soon`}
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
