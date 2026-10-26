import React from "react";

type Props = { children: React.ReactNode; style?: React.CSSProperties };

export const GlassCard: React.FC<Props> = ({ children, style }) => (
  <div
    style={{
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(12px)",
      borderRadius: "24px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
      border: "1px solid rgba(255, 255, 255, 0.8)",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);
