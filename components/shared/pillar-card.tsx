import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { OfferingLineArt } from "@/components/shared/offering-line-art"

interface PillarCardProps {
  title: string
  description: string
  href: string
  imageSrc?: string
  imageAlt?: string
  className?: string
}

export function PillarCard({
  title,
  description,
  href,
  imageSrc,
  imageAlt,
  className,
}: PillarCardProps) {
  return (
    <Link
      href={href}
      aria-label={`Explore ${title}`}
      className={cn(
        "group block overflow-hidden rounded-lg border border-[var(--border)] bg-white/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--muted)] text-[var(--primary)]">
        {imageSrc ? (
          <Image
            alt={imageAlt ?? ""}
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            src={imageSrc}
          />
        ) : (
          <div className="absolute inset-x-0 top-0 h-2/3 opacity-55">
            <OfferingLineArt
              kind={title as "Beauty" | "Movement" | "Retreats" | "Ritual"}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/75 via-[var(--primary)]/8 to-white/5" />
        <h3 className="absolute right-5 bottom-5 left-5 text-4xl leading-none font-medium text-white md:text-5xl">
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
  )
}
