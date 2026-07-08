"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { MAIN_NAV } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
      {MAIN_NAV.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (item.children) {
          return (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1 border-b border-transparent py-2 text-sm font-medium tracking-wide text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]",
                  isActive &&
                    "border-[var(--primary)] text-[var(--primary)]"
                )}
              >
                {item.label}
                <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="invisible absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="rounded-lg border border-[var(--border)] bg-white p-2 shadow-lg">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-md p-3 transition-colors hover:bg-[var(--muted)]"
                    >
                      <span className="block text-sm font-medium text-[var(--foreground)]">
                        {child.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-[var(--muted-foreground)]">
                        {child.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "border-b border-transparent py-2 text-sm font-medium tracking-wide text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]",
              isActive && "border-[var(--primary)] text-[var(--primary)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
