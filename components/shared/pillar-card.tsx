import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PillarCardProps {
  title: string;
  description: string;
  href: string;
  imageAlt?: string;
  className?: string;
}

export function PillarCard({
  title,
  description,
  href,
  imageAlt,
  className,
}: PillarCardProps) {
  return (
    <Link
      href={href}
      aria-label={imageAlt ? `${title}: ${imageAlt}` : `Explore ${title}`}
      className={cn(
        "group block overflow-hidden rounded-lg border border-[var(--border)] bg-white/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[4/5] bg-[var(--muted)]">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/35 via-transparent to-transparent" />
        <h3 className="absolute bottom-5 left-5 right-5 text-4xl font-medium leading-none text-white md:text-5xl">
          {title}
        </h3>
      </div>
      <div className="p-6">
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          {description}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline-offset-4 group-hover:underline">
          Explore
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
