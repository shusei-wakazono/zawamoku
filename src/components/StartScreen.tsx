import React from "react";
import { PrimaryButton } from "./ui/PrimaryButton";
import { ScreenTitle } from "./ui/ScreenTitle"; // 追加

type StartScreenProps = {
  onStart: () => void;
};

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 共通タイトルコンポーネントを使用 */}
      <ScreenTitle style={{ marginBottom: "24px" }}>ざわモク</ScreenTitle>

      {/* アニメーション付き: シンプルなヘッドホン装着アイコン */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxHeight: "260px",
          margin: "8px 0 20px 0",
        }}
      >
        {/* (CSSとSVGは前回のヘッドホンコードそのまま) */}
        <style>
          {`
            @keyframes dropAndSqueeze {
              0% { transform: translateY(-15px); }
              35% { transform: translateY(0px); }
              100% { transform: translateY(0px); }
            }
            @keyframes bandStretch {
              0%, 15% { transform: scaleX(1.1); }
              35%, 100% { transform: scaleX(1); }
            }
            @keyframes earCupLeft {
              0%, 15% { transform: translateX(-6px) rotate(-12deg); }
              35%, 100% { transform: translateX(0) rotate(0deg); }
            }
            @keyframes earCupRight {
              0%, 15% { transform: translateX(6px) rotate(12deg); }
              35%, 100% { transform: translateX(0) rotate(0deg); }
            }
            .headphone-group { animation: dropAndSqueeze 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; transform-origin: center; }
            .headphone-band { animation: bandStretch 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; transform-origin: center top; }
            .headphone-cup-l { animation: earCupLeft 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; transform-origin: 50px 100px; }
            .headphone-cup-r { animation: earCupRight 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; transform-origin: 150px 100px; }
          `}
        </style>
        <svg
          viewBox="0 0 200 200"
          width="160"
          height="160"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <g
            className="headphone-group"
            stroke="#334155"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              className="headphone-band"
              d="M 50,110 C 40,40 160,40 150,110"
            />
            <g className="headphone-cup-l">
              <rect
                x="38"
                y="90"
                width="16"
                height="46"
                rx="8"
                fill="#ffffff"
              />
              <path
                d="M 38,98 C 22,98 22,128 38,128"
                fill="#f8fafc"
                strokeWidth="4"
              />
            </g>
            <g className="headphone-cup-r">
              <rect
                x="146"
                y="90"
                width="16"
                height="46"
                rx="8"
                fill="#ffffff"
              />
              <path
                d="M 162,98 C 178,98 178,128 162,128"
                fill="#f8fafc"
                strokeWidth="4"
              />
            </g>
          </g>
        </svg>
      </div>

      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#2d3748",
            margin: "0 0 14px 0",
            lineHeight: "1.45",
          }}
        >
          イヤホンをつけると、
          <br />
          まわりの気配が立体的に
          <br />
          聴こえます
        </h2>
        <p
          style={{
            fontSize: "12.5px",
            color: "#718096",
            margin: "0",
            lineHeight: "1.6",
          }}
        >
          カフェや図書館のような適度なざわめきの
          <br />
          中で作業に没入しましょう
        </p>
      </div>

      <div style={{ width: "100%", marginTop: "auto", paddingBottom: "16px" }}>
        <PrimaryButton onClick={onStart} icon="🎧">
          イヤホンをつけて作業を始める ➔
        </PrimaryButton>
      </div>
    </div>
  );
};
