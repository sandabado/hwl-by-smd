"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled && "bg-[var(--background)]/95 shadow-sm backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20">
        <Link href="/" className="shrink-0">
          <span className="block font-serif text-xl font-medium leading-none text-[var(--primary)] md:text-2xl">
            {SITE_CONFIG.name}
          </span>
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
            {SITE_CONFIG.tagline}
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <MainNav />
          <Button
            asChild
            size="sm"
            className="h-9 rounded-full bg-[var(--accent)] px-6 text-white hover:bg-[var(--primary)]"
          >
            <Link href="/book">Book</Link>
          </Button>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
