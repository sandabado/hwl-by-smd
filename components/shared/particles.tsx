"use client"

import type { CSSProperties } from "react"

const particles = [
  [8, 18, 2, 22],
  [18, 72, 3, 28],
  [27, 36, 2, 25],
  [39, 84, 4, 31],
  [51, 20, 2, 27],
  [62, 66, 5, 34],
  [74, 44, 3, 29],
  [83, 78, 2, 24],
  [91, 28, 4, 33],
  [46, 55, 2, 30],
]

export function Particles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map(([left, top, size, duration], index) => (
        <span
          className="particle"
          key={`${left}-${top}`}
          style={
            {
              "--particle-duration": `${duration}s`,
              "--particle-size": `${size}px`,
              animationDelay: `${index * -3}s`,
              left: `${left}%`,
              top: `${top}%`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
