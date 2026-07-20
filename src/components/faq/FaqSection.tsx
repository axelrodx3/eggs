"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { faqItems } from "@/data/faq";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-24">
      <div className="section-shell max-w-3xl">
        <p className="section-kicker">FAQ</p>
        <h2 className="section-title">Questions & answers</h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((item) => {
            const open = openId === item.id;
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <h3>
                  <button
                    type="button"
                    className="focus-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    {item.question}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 transition",
                        open && "rotate-180 text-lime",
                      )}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-foreground/80">
                        {item.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
