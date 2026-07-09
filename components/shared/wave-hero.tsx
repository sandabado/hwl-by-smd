"use client"

import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

export type WaveHeroVariant =
  "desert" | "earth" | "flow" | "guidance" | "retreat" | "ritual"

type LineLayer = {
  color: string
  duration: number
  opacity: number
  path: string
  reverse?: boolean
  width: number
}

const lineLayers: Record<Exclude<WaveHeroVariant, "ritual">, LineLayer[]> = {
  desert: [
    {
      color: "#bfa481",
      duration: 34,
      opacity: 0.2,
      path: "M-220,370 C120,318 310,396 590,344 C870,292 1080,374 1320,332 C1480,304 1600,318 1710,292",
      width: 2,
    },
    {
      color: "#d0b995",
      duration: 42,
      opacity: 0.16,
      path: "M-240,455 C90,414 340,468 640,426 C900,390 1100,448 1370,402 C1530,374 1640,388 1720,370",
      reverse: true,
      width: 1.5,
    },
    {
      color: "#8b7e6d",
      duration: 50,
      opacity: 0.1,
      path: "M-240,545 C130,502 420,570 760,520 C1020,482 1250,548 1510,506 C1600,492 1680,500 1740,486",
      width: 1,
    },
    {
      color: "#faf7f2",
      duration: 38,
      opacity: 0.36,
      path: "M-220,650 C110,620 430,674 780,634 C1050,604 1260,642 1500,615 C1620,602 1710,610 1780,594",
      reverse: true,
      width: 3,
    },
    {
      color: "#a98f6c",
      duration: 56,
      opacity: 0.07,
      path: "M-230,305 C90,265 350,338 660,298 C925,265 1160,312 1445,278 C1570,264 1660,270 1740,252",
      width: 0.8,
    },
    {
      color: "#cbb696",
      duration: 46,
      opacity: 0.12,
      path: "M-230,410 C120,382 420,438 735,398 C1000,365 1210,410 1490,376 C1590,365 1680,370 1760,354",
      reverse: true,
      width: 1,
    },
    {
      color: "#e5d8c6",
      duration: 60,
      opacity: 0.13,
      path: "M-230,585 C80,560 390,610 705,574 C975,544 1190,586 1460,558 C1580,546 1670,552 1760,536",
      width: 1.2,
    },
    {
      color: "#ffffff",
      duration: 52,
      opacity: 0.22,
      path: "M-230,720 C90,700 390,735 720,710 C1000,690 1220,715 1480,696 C1595,688 1690,692 1770,682",
      reverse: true,
      width: 1.4,
    },
  ],
  flow: [
    {
      color: "#d8bf8c",
      duration: 30,
      opacity: 0.18,
      path: "M-230,310 C40,210 230,446 520,326 C760,226 920,430 1200,310 C1400,224 1540,305 1720,250",
      width: 2.5,
    },
    {
      color: "#c4a882",
      duration: 36,
      opacity: 0.14,
      path: "M-220,430 C100,330 310,545 610,420 C880,308 1030,520 1330,405 C1500,340 1610,398 1720,350",
      reverse: true,
      width: 2,
    },
    {
      color: "#ffffff",
      duration: 44,
      opacity: 0.42,
      path: "M-260,565 C70,474 350,655 690,558 C930,490 1130,628 1410,545 C1530,508 1640,535 1740,500",
      width: 4,
    },
    {
      color: "#a89888",
      duration: 52,
      opacity: 0.08,
      path: "M-220,660 C120,606 420,708 760,650 C1040,602 1230,688 1520,628 C1600,612 1680,620 1740,598",
      reverse: true,
      width: 1,
    },
    {
      color: "#eadcc4",
      duration: 40,
      opacity: 0.16,
      path: "M-220,255 C65,180 270,360 555,270 C815,190 985,345 1245,260 C1430,200 1580,246 1740,212",
      width: 1.4,
    },
    {
      color: "#bfa47d",
      duration: 48,
      opacity: 0.1,
      path: "M-230,372 C80,288 330,488 650,370 C885,284 1080,465 1370,360 C1515,308 1640,350 1760,318",
      reverse: true,
      width: 1.2,
    },
    {
      color: "#f7efe4",
      duration: 56,
      opacity: 0.28,
      path: "M-230,505 C60,430 355,585 655,500 C930,422 1135,560 1405,490 C1545,454 1645,486 1760,452",
      width: 2,
    },
    {
      color: "#dcc8a0",
      duration: 60,
      opacity: 0.12,
      path: "M-240,725 C120,670 420,765 760,710 C1020,668 1260,742 1520,694 C1610,678 1690,688 1760,670",
      reverse: true,
      width: 1,
    },
  ],
  earth: [
    {
      color: "#839078",
      duration: 28,
      opacity: 0.15,
      path: "M-230,255 C130,320 320,220 640,282 C930,338 1180,238 1510,292 C1600,306 1680,298 1740,312",
      width: 2,
    },
    {
      color: "#a8b0a0",
      duration: 34,
      opacity: 0.22,
      path: "M-220,395 C170,465 390,352 720,420 C1010,480 1200,375 1500,430 C1600,448 1680,438 1760,452",
      reverse: true,
      width: 2.5,
    },
    {
      color: "#8b7e6d",
      duration: 40,
      opacity: 0.1,
      path: "M-250,525 C120,585 420,490 760,548 C1050,598 1280,510 1530,556 C1620,572 1690,562 1760,578",
      width: 1.5,
    },
    {
      color: "#faf7f2",
      duration: 48,
      opacity: 0.34,
      path: "M-230,675 C160,718 420,640 780,682 C1060,715 1260,660 1510,690 C1605,702 1680,690 1750,704",
      reverse: true,
      width: 4,
    },
    {
      color: "#6f7b68",
      duration: 52,
      opacity: 0.08,
      path: "M-230,190 C110,246 360,165 680,218 C980,268 1210,190 1510,232 C1610,246 1690,238 1760,252",
      width: 1,
    },
    {
      color: "#bcc4b4",
      duration: 46,
      opacity: 0.16,
      path: "M-230,330 C150,388 430,300 760,355 C1040,402 1250,326 1530,365 C1620,378 1690,370 1760,386",
      reverse: true,
      width: 1.3,
    },
    {
      color: "#9ba68f",
      duration: 58,
      opacity: 0.12,
      path: "M-240,460 C120,520 400,430 735,482 C1025,528 1260,455 1530,496 C1625,510 1700,502 1770,516",
      width: 1.2,
    },
    {
      color: "#ffffff",
      duration: 54,
      opacity: 0.22,
      path: "M-230,610 C130,650 450,590 780,625 C1060,654 1280,612 1510,640 C1605,652 1695,642 1760,656",
      reverse: true,
      width: 1.8,
    },
  ],
  guidance: [
    {
      color: "#a89888",
      duration: 26,
      opacity: 0.16,
      path: "M-210,255 C80,205 260,330 545,270 C760,225 940,310 1165,258 C1370,210 1530,250 1720,205",
      width: 1,
    },
    {
      color: "#d4b888",
      duration: 32,
      opacity: 0.14,
      path: "M-230,335 C100,292 300,398 610,345 C850,305 1020,380 1285,335 C1450,308 1600,330 1740,298",
      reverse: true,
      width: 0.9,
    },
    {
      color: "#8b7e6d",
      duration: 38,
      opacity: 0.1,
      path: "M-230,425 C120,390 360,475 690,432 C930,400 1100,458 1350,420 C1510,395 1630,410 1740,388",
      width: 0.8,
    },
    {
      color: "#c4a882",
      duration: 44,
      opacity: 0.11,
      path: "M-230,520 C90,488 360,555 705,525 C970,502 1180,542 1420,512 C1550,496 1640,505 1740,488",
      reverse: true,
      width: 0.8,
    },
    {
      color: "#ffffff",
      duration: 50,
      opacity: 0.32,
      path: "M-230,625 C130,602 410,654 765,630 C1040,612 1250,640 1500,618 C1600,610 1680,614 1760,602",
      width: 1.2,
    },
    {
      color: "#b7a28e",
      duration: 56,
      opacity: 0.08,
      path: "M-230,295 C95,252 315,365 640,305 C900,258 1080,338 1350,290 C1510,262 1630,280 1760,248",
      reverse: true,
      width: 0.65,
    },
    {
      color: "#d7c7aa",
      duration: 62,
      opacity: 0.1,
      path: "M-230,380 C95,350 360,425 690,386 C960,354 1160,405 1420,374 C1545,360 1650,366 1760,344",
      width: 0.7,
    },
    {
      color: "#f0e5d6",
      duration: 68,
      opacity: 0.16,
      path: "M-230,475 C120,450 405,505 740,480 C1010,460 1220,486 1490,466 C1600,458 1680,462 1760,450",
      reverse: true,
      width: 0.75,
    },
    {
      color: "#8b7e6d",
      duration: 72,
      opacity: 0.07,
      path: "M-230,690 C140,670 450,710 795,692 C1070,678 1290,700 1510,684 C1610,678 1690,680 1760,670",
      width: 0.65,
    },
  ],
  retreat: [
    {
      color: "#b89a8a",
      duration: 44,
      opacity: 0.16,
      path: "M-260,270 C120,250 380,292 710,264 C980,242 1220,270 1510,248 C1605,240 1690,242 1760,235",
      width: 2,
    },
    {
      color: "#c4a882",
      duration: 52,
      opacity: 0.18,
      path: "M-260,395 C90,362 410,424 750,385 C1020,354 1240,398 1510,370 C1610,360 1690,365 1760,354",
      reverse: true,
      width: 2.2,
    },
    {
      color: "#8b7e6d",
      duration: 58,
      opacity: 0.08,
      path: "M-260,520 C130,482 430,552 790,508 C1060,475 1280,526 1525,496 C1615,486 1700,490 1770,480",
      width: 1,
    },
    {
      color: "#faf7f2",
      duration: 36,
      opacity: 0.36,
      path: "M-240,672 C100,646 440,690 780,662 C1060,638 1260,670 1500,650 C1600,642 1690,648 1770,635",
      reverse: true,
      width: 4,
    },
    {
      color: "#a88373",
      duration: 62,
      opacity: 0.08,
      path: "M-260,218 C100,198 390,230 720,210 C990,194 1230,214 1510,198 C1610,190 1690,194 1760,185",
      width: 0.8,
    },
    {
      color: "#d4bc9d",
      duration: 68,
      opacity: 0.14,
      path: "M-260,330 C120,302 405,354 740,322 C1010,298 1230,328 1510,305 C1610,298 1690,300 1760,290",
      reverse: true,
      width: 1.1,
    },
    {
      color: "#caa696",
      duration: 48,
      opacity: 0.12,
      path: "M-260,468 C90,438 420,495 755,458 C1020,430 1245,470 1515,444 C1615,434 1700,438 1770,426",
      width: 1,
    },
    {
      color: "#ffffff",
      duration: 54,
      opacity: 0.22,
      path: "M-250,610 C120,585 450,628 780,602 C1050,580 1280,606 1510,590 C1610,582 1695,586 1770,572",
      reverse: true,
      width: 1.5,
    },
  ],
}

const backgrounds: Record<WaveHeroVariant, string> = {
  desert: "bg-[#eee6db]",
  earth: "bg-[#e7e1d6]",
  flow: "bg-[#f4eee4]",
  guidance: "bg-[#f7f1e8]",
  retreat: "bg-[#eee3da]",
  ritual: "bg-[#e6d9cf]",
}

function LineWaves({
  variant,
}: {
  variant: Exclude<WaveHeroVariant, "ritual">
}) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 1440 800"
    >
      <defs>
        <filter
          id={`soften-${variant}`}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feGaussianBlur stdDeviation="0.18" />
        </filter>
      </defs>
      {lineLayers[variant].map((layer, index) => (
        <path
          className={cn(
            "wave-line",
            layer.reverse && "wave-line--reverse",
            index % 3 === 0 && "wave-line--breathe"
          )}
          d={layer.path}
          fill="none"
          filter={`url(#soften-${variant})`}
          key={layer.path}
          opacity={layer.opacity}
          stroke={layer.color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={layer.width}
          style={
            {
              "--wave-duration": `${layer.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  )
}

function RitualWaves() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 800"
    >
      {[95, 130, 180, 220, 270, 325, 385, 445, 520, 590].map(
        (radius, index) => (
          <circle
            className="ritual-ring"
            cx="720"
            cy="365"
            fill="none"
            key={radius}
            r={radius}
            stroke={index % 2 === 0 ? "#8b6f5a" : "#c4a882"}
            strokeWidth={index < 4 ? 1.1 : 0.7}
            style={
              {
                "--ring-duration": `${30 + index * 5}s`,
                opacity: 0.12 - index * 0.008,
              } as CSSProperties
            }
          />
        )
      )}
      {[
        "M-180,500 C130,450 395,555 710,505 C1010,456 1250,520 1620,475",
        "M-180,545 C175,500 430,590 745,535 C1015,488 1255,560 1620,510",
        "M-180,585 C150,515 415,650 720,585 C1010,522 1230,615 1620,548",
        "M-180,670 C210,625 470,710 815,660 C1085,620 1310,682 1620,626",
      ].map((path, index) => (
        <path
          className={cn("wave-line", index === 1 && "wave-line--reverse")}
          d={path}
          fill="none"
          key={path}
          opacity={index < 2 ? 0.09 : 0.13 - index * 0.02}
          stroke={index % 2 === 0 ? "#9a8478" : "#8b6f5a"}
          strokeLinecap="round"
          strokeWidth={index < 2 ? 1 : 1.5}
          style={{ "--wave-duration": `${44 + index * 8}s` } as CSSProperties}
        />
      ))}
    </svg>
  )
}

export function WaveHero({
  className,
  variant,
}: {
  className?: string
  variant: WaveHeroVariant
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        backgrounds[variant],
        className
      )}
    >
      {variant === "ritual" ? <RitualWaves /> : <LineWaves variant={variant} />}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.5),transparent_34%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/35 to-transparent" />
    </div>
  )
}
