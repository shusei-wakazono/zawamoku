import React from "react";

type Props = {
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
};

export const PrimaryButton: React.FC<Props> = ({
  onClick,
  children,
  icon,
  style,
}) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      padding: "17px",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#ffffff",
      background: "linear-gradient(90deg, #ef4444 0%, #ea580c 100%)",
      border: "none",
      borderRadius: "9999px",
      cursor: "pointer",
      boxShadow: "0 8px 24px rgba(239, 68, 68, 0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "transform 0.1s ease",
      ...style,
    }}
    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {icon && <span>{icon}</span>}
    <span>{children}</span>
  </button>
);
