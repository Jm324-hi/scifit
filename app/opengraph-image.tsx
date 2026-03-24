import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Kineroz - Science-Based Smart Training";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #22d3ee 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            K
          </div>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            Kineroz
          </span>
        </div>
        <p
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            margin: 0,
          }}
        >
          Train Smarter. Progress Faster.
        </p>
      </div>
    ),
    { ...size },
  );
}
