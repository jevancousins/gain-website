import { ImageResponse } from "next/og";

export const alt = "Gain Strength Therapy — strength training in Eastbourne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph image. Shown in WhatsApp, iMessage, Facebook, LinkedIn
 * and Twitter link previews. Deliberately simple — typography + brand flame.
 */
export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            GAIN
          </div>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.6,
              paddingLeft: 18,
              borderLeft: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Strength Therapy
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#ffffff",
            }}
          >
            Train smarter.
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 500,
              fontStyle: "italic",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            Move better.
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#FC832C",
            }}
          >
            Build lasting strength.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 15,
            opacity: 0.6,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontWeight: 600,
          }}
        >
          <span>Eastbourne · BN22 8DJ</span>
          <span>gainstrengththerapy.com</span>
        </div>
      </div>
    ),
    size
  );
}
