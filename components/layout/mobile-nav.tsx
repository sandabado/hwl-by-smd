"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Menu, Phone } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MAIN_NAV } from "@/lib/nav-config";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      "block rounded-lg px-3 py-2 text-base font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
      (href === "/" ? pathname === "/" : pathname.startsWith(href)) &&
        "bg-[var(--muted)] text-[var(--primary)]"
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-80 gap-0 bg-[var(--background)] p-0 text-[var(--foreground)] sm:max-w-80"
      >
        <div className="flex h-full flex-col p-6">
          <SheetTitle className="font-serif text-2xl font-medium text-[var(--primary)]">
            {SITE_CONFIG.name}
          </SheetTitle>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
            {SITE_CONFIG.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-2">
            {MAIN_NAV.map((item) =>
              item.children ? (
                <Accordion
                  key={item.href}
                  type="single"
                  collapsible
                  defaultValue={pathname.startsWith(item.href) ? item.href : ""}
                >
                  <AccordionItem value={item.href} className="border-0">
                    <AccordionTrigger
                      className={cn(
                        "rounded-lg px-3 py-2 text-base font-medium text-[var(--muted-foreground)] no-underline hover:bg-[var(--muted)] hover:no-underline",
                        pathname.startsWith(item.href) &&
                          "bg-[var(--muted)] text-[var(--primary)]"
                      )}
                    >
                      {item.label}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-1 pl-4 pt-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className={linkClass(child.href)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={linkClass(item.href)}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          <div className="mt-auto border-t border-[var(--border)] pt-6">
            <Button
              asChild
              className="h-10 w-full rounded-full bg-[var(--primary)] text-white hover:bg-[var(--accent)]"
            >
              <Link href="/book" onClick={() => setOpen(false)}>
                Book an Experience
              </Link>
            </Button>
            <div className="mt-6 space-y-3 text-sm text-[var(--muted-foreground)]">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 hover:text-[var(--foreground)]"
              >
                <Mail className="size-4" />
                {SITE_CONFIG.email}
              </a>
              <a
                href={`tel:${SITE_CONFIG.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-2 hover:text-[var(--foreground)]"
              >
                <Phone className="size-4" />
                {SITE_CONFIG.phone}
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="size-4" />
                {SITE_CONFIG.location}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
