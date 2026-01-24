import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle inner glow */}
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
        {/* Screening layers - three horizontal bars with decreasing opacity */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            alignItems: "center",
          }}
        >
          {/* Top bar - full width */}
          <div
            style={{
              width: 18,
              height: 4,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 2,
            }}
          />
          {/* Middle bar - medium width */}
          <div
            style={{
              width: 14,
              height: 4,
              background: "rgba(255,255,255,0.75)",
              borderRadius: 2,
            }}
          />
          {/* Bottom bar - narrowest (filtered result) */}
          <div
            style={{
              width: 8,
              height: 4,
              background: "rgba(255,255,255,0.55)",
              borderRadius: 2,
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
