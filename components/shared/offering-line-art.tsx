type OfferingLineArtKind = "Beauty" | "Movement" | "Retreats" | "Ritual";

const commonProps = {
  "aria-hidden": true,
  className: "h-full w-full",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 320 400",
};

export function OfferingLineArt({ kind }: { kind: OfferingLineArtKind }) {
  if (kind === "Beauty") {
    return (
      <svg {...commonProps}>
        <path d="M88 238c46 40 98 42 144 0" opacity="0.34" />
        <path d="M116 214c10 16 28 26 44 26s34-10 44-26" opacity="0.7" />
        <path d="M107 178c29-38 77-38 106 0" />
        <path d="M129 174c8-8 20-13 31-13s23 5 31 13" opacity="0.52" />
        <path d="M160 86c-25 38-38 68-38 90 0 26 17 48 38 48s38-22 38-48c0-22-13-52-38-90Z" />
        <path d="M160 118c-11 22-17 39-17 53" opacity="0.38" />
        <path d="M82 286c44 24 112 25 156 0" opacity="0.28" />
      </svg>
    );
  }

  if (kind === "Movement") {
    return (
      <svg {...commonProps}>
        <path d="M70 256c38-58 75-86 111-84 30 2 53 24 69 66" />
        <path d="M96 244c28-24 57-34 87-30 21 3 40 14 57 33" opacity="0.44" />
        <path d="M160 94c18 26 27 51 27 75 0 33-14 61-27 61s-27-28-27-61c0-24 9-49 27-75Z" opacity="0.64" />
        <path d="M160 110v172" opacity="0.3" />
        <path d="M103 305c39 18 75 18 114 0" opacity="0.34" />
      </svg>
    );
  }

  if (kind === "Ritual") {
    return (
      <svg {...commonProps}>
        <path d="M160 78a64 64 0 1 0 0 128 44 44 0 1 1 0-88" />
        <path d="M82 272c52-35 104-35 156 0" opacity="0.42" />
        <path d="M100 294c42-22 78-22 120 0" opacity="0.28" />
        <path d="M160 238v62" opacity="0.5" />
        <path d="M132 268h56" opacity="0.5" />
        <path d="M231 124l8-15 8 15 15 8-15 8-8 15-8-15-15-8 15-8Z" opacity="0.74" />
        <path d="M96 128l5-9 5 9 9 5-9 5-5 9-5-9-9-5 9-5Z" opacity="0.42" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M78 254c34-48 64-72 91-72s51 24 73 72" />
      <path d="M91 282c48-28 91-28 138 0" opacity="0.36" />
      <path d="M116 216c25-20 55-20 80 0" opacity="0.36" />
      <path d="M92 150c29-18 55-21 78-10 17 8 35 8 58-4" />
      <path d="M99 124c30-16 56-17 78-2 15 10 32 10 52-2" opacity="0.42" />
      <path d="M160 84c-14 28-20 52-18 72 2 19 9 32 18 32s16-13 18-32c2-20-4-44-18-72Z" opacity="0.52" />
      <path d="M111 320c33 9 65 9 98 0" opacity="0.28" />
    </svg>
  );
}
