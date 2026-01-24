import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #C45C3B 0%, #9A3A20 100%)",
          borderRadius: 40,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle inner glow for depth */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 50%)",
          }}
        />
        {/* Screening layers - three horizontal bars representing funnel/filter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
          }}
        >
          {/* Top bar - full width (all candidates) */}
          <div
            style={{
              width: 100,
              height: 22,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 11,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
          {/* Middle bar - medium width (screened) */}
          <div
            style={{
              width: 72,
              height: 22,
              background: "rgba(255,255,255,0.75)",
              borderRadius: 11,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          />
          {/* Bottom bar - narrowest (top talent) */}
          <div
            style={{
              width: 44,
              height: 22,
              background: "rgba(255,255,255,0.55)",
              borderRadius: 11,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
