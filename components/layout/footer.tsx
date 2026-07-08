import Link from "next/link";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";

import { FOOTER_NAV, SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[var(--primary)] text-[var(--background)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="font-serif text-2xl font-medium">
              {SITE_CONFIG.name}
            </Link>
            <p className="mt-2 text-sm opacity-80">{SITE_CONFIG.tagline}</p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed opacity-60">
              Licensed Aesthetician · 500hr Yoga Instructor · Reiki
              Practitioner · Aromatherapy Specialist · Wellness Facilitator
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.24em] opacity-60">
              Navigate
            </h2>
            <nav className="grid grid-cols-2 gap-x-8 gap-y-3">
              {FOOTER_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm opacity-80 transition hover:text-[var(--accent)] hover:opacity-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.24em] opacity-60">
              Connect
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 opacity-80 transition hover:text-[var(--accent)] hover:opacity-100"
              >
                <Mail className="size-4" />
                {SITE_CONFIG.email}
              </a>
              <a
                href={`tel:${SITE_CONFIG.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-2 opacity-80 transition hover:text-[var(--accent)] hover:opacity-100"
              >
                <Phone className="size-4" />
                {SITE_CONFIG.phone}
              </a>
              <a
                href={SITE_CONFIG.instagramPersonalUrl}
                className="flex items-center gap-2 opacity-80 transition hover:text-[var(--accent)] hover:opacity-100"
              >
                <AtSign className="size-4" />
                {SITE_CONFIG.instagramPersonal}
              </a>
              <a
                href={SITE_CONFIG.instagramBrandUrl}
                className="flex items-center gap-2 opacity-80 transition hover:text-[var(--accent)] hover:opacity-100"
              >
                <AtSign className="size-4" />
                {SITE_CONFIG.instagramBrand}
              </a>
              <p className="flex items-center gap-2 opacity-80">
                <MapPin className="size-4" />
                {SITE_CONFIG.location}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs opacity-50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {SITE_CONFIG.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
