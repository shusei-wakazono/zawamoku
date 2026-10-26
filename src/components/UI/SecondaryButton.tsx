import React from "react";

type Props = {
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const SecondaryButton: React.FC<Props> = ({
  onClick,
  children,
  style,
}) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      padding: "14px",
      fontSize: "15px",
      fontWeight: "700",
      color: "#64748b",
      backgroundColor: "#f1f5f9",
      border: "none",
      borderRadius: "9999px",
      cursor: "pointer",
      transition: "background-color 0.15s ease, transform 0.1s ease",
      ...style,
    }}
    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {children}
  </button>
);
