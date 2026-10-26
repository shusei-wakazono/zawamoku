import React, { useEffect } from "react";

type Props = { children: React.ReactNode };

export const GradientContainer: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    const preventDefault = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
      document.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        background:
          "linear-gradient(180deg, #e0f2fe 0%, #ffffff 45%, #fee2e2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
};
