import Link from "next/link";

import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="flex min-h-screen items-center justify-center px-6 py-24 text-center">
      <div>
        <h1 className="text-4xl font-medium leading-tight text-[var(--primary)] md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 text-base text-[var(--muted-foreground)]">
          Content coming soon.
        </p>
        <Button
          asChild
          className="mt-8 rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]"
        >
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </section>
  );
}
