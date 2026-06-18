import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

export const alt = "Gain Strength Therapy: strength training in Eastbourne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(
  family: string,
  weight: number,
  italic = false
): Promise<ArrayBuffer> {
  const axis = `ital,wght@${italic ? 1 : 0},${weight}`;
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${axis}&display=swap`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    )
  ).text();
  const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error(`No font URL found for ${family} ${weight}`);
  return (await fetch(fontUrl)).arrayBuffer();
}

export default async function OgImage() {
  const [logoBuffer, font900, font500italic, font700] = await Promise.all([
    readFile(path.join(process.cwd(), "public/media/logo.png")),
    loadGoogleFont("Montserrat", 900),
    loadGoogleFont("Montserrat", 500, true),
    loadGoogleFont("Montserrat", 700),
  ]);

  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

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
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {/* Real logo: white wordmark + runner icon, transparent background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={248}
          height={80}
          alt=""
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />

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
            The gym.
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
            For people
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
            who don&#39;t like gyms.
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
            fontWeight: 700,
          }}
        >
          <span>Eastbourne · BN22 8DJ</span>
          <span>gainstrengththerapy.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: font900, weight: 900, style: "normal" },
        { name: "Montserrat", data: font500italic, weight: 500, style: "italic" },
        { name: "Montserrat", data: font700, weight: 700, style: "normal" },
      ],
    }
  );
}
