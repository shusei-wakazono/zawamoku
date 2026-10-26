import React from "react";

type CapsuleToolbarProps = {
  isStealth?: boolean;
  onPause?: () => void;
  onToggleVisibility?: () => void;
};

export const CapsuleToolbar: React.FC<CapsuleToolbarProps> = ({
  isStealth = false,
  onPause,
  onToggleVisibility,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderRadius: "9999px",
        padding: "10px 26px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.04)",
        gap: "20px",
        marginTop: "28px",
      }}
    >
      {/* 一時停止ボタン */}
      <button
        onClick={onPause}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: 0,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" fill="#1e293b" />
          <rect x="14" y="4" width="4" height="16" rx="1" fill="#1e293b" />
        </svg>
      </button>

      {/* 区切り線 */}
      <div
        style={{ width: "1px", height: "16px", backgroundColor: "#e2e8f0" }}
      />

      {/* 目アイコン (通常 / 斜線付き のトグル表示) */}
      <button
        onClick={onToggleVisibility}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: 0,
        }}
      >
        {isStealth ? (
          // 斜線付きの目アイコン (非表示モード)
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          // 通常の目アイコン
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
};
