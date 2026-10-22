import React from "react";

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const ScreenTitle: React.FC<Props> = ({ children, style }) => (
  <h2
    style={{
      fontSize: "22px",
      fontWeight: "700",
      color: "#1e293b",
      margin: "0",
      letterSpacing: "0.04em",
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </h2>
);
