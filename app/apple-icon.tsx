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
          fontSize: 120,
          background: "linear-gradient(135deg, #E07A5F 0%, #C45A3B 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
        }}
      >
        <span
          style={{
            color: "white",
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          S
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
