import React from "react";

type TimerDisplayProps = {
  hours: string;
  minutes: string;
  seconds: string;
  isStealth?: boolean;
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  hours,
  minutes,
  seconds,
  isStealth = false,
}) => {
  // 切り替え時に画面が動かないよう高さを固定
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "72px",
    margin: "0 0 16px 0",
    width: "100%",
  };

  if (isStealth) {
    // ステルスインジケーター (-- : -- : --)
    const barStyle = (color = "#94a3b8"): React.CSSProperties => ({
      width: "26px",
      height: "6px",
      borderRadius: "3px",
      backgroundColor: color,
    });

    const colonStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      margin: "0 6px",
    };

    const dotStyle: React.CSSProperties = {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: "#94a3b8",
    };

    return (
      <div style={{ ...containerStyle, gap: "6px" }}>
        {/* 時 */}
        <div style={barStyle()} />
        <div style={barStyle()} />

        {/* コロン */}
        <div style={colonStyle}>
          <div style={dotStyle} />
          <div style={dotStyle} />
        </div>

        {/* 分 */}
        <div style={barStyle()} />
        <div style={barStyle()} />

        {/* コロン */}
        <div style={colonStyle}>
          <div style={dotStyle} />
          <div style={dotStyle} />
        </div>

        {/* 秒 (視認性のある温かいアンバーオレンジ) */}
        <div style={barStyle("#f97316")} />
        <div style={barStyle("#f97316")} />
      </div>
    );
  }

  // 通常タイマー表示 (オレンジに負けない力強いタイポグラフィ)
  return (
    <div
      style={{
        ...containerStyle,
        fontSize: "62px",
        fontWeight: "800",
        color: "#0f172a", // くっきり引き締まるディープスレート
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        letterSpacing: "-0.03em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span>
        {hours}:{minutes}:
      </span>
      {/* 終了ボタンのグラデーションと同等以上の存在感を持つコーラルオレンジ */}
      <span style={{ color: "#ea580c" }}>{seconds}</span>
    </div>
  );
};
