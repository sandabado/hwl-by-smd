import { ImageResponse } from "next/og"

export const OG_IMAGE_SIZE = {
  height: 630,
  width: 1200,
} as const

export const OG_IMAGE_CONTENT_TYPE = "image/png"

export function createBrandOgImage({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background:
          "linear-gradient(135deg, #f6f0e7 0%, #ece2d6 52%, #d9c4ae 100%)",
        color: "#30372f",
        display: "flex",
        height: "100%",
        overflow: "hidden",
        padding: "64px 72px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(111, 91, 69, 0.22)",
          borderRadius: 44,
          display: "flex",
          inset: 32,
          position: "absolute",
        }}
      />
      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.55)",
          borderRadius: "50%",
          display: "flex",
          height: 570,
          position: "absolute",
          right: -130,
          top: -185,
          width: 570,
        }}
      />
      <div
        style={{
          background: "rgba(255,255,255,0.28)",
          borderRadius: "50%",
          bottom: -235,
          display: "flex",
          height: 530,
          left: 390,
          position: "absolute",
          width: 530,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          HWL · SMD
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 860,
          }}
        >
          <div
            style={{
              color: "#a07857",
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.18em",
              marginBottom: 20,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: title.length > 38 ? 66 : 80,
              letterSpacing: "-0.035em",
              lineHeight: 0.98,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 21,
            justifyContent: "space-between",
            letterSpacing: "0.08em",
            opacity: 0.64,
          }}
        >
          <span>Beauty · Body · Being</span>
          <span>howlbysmd.com</span>
        </div>
      </div>
    </div>,
    OG_IMAGE_SIZE
  )
}
