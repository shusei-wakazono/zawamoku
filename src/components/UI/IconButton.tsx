import React from "react";

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const IconButton: React.FC<Props> = ({ onClick, children, style }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#64748b",
      display: "flex",
      alignItems: "center",
      padding: "8px",
      ...style,
    }}
  >
    {children}
  </button>
);
