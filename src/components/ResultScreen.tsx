import React from "react";
import { GlassCard } from "./ui/GlassCard";
import { PrimaryButton } from "./ui/PrimaryButton";
import { ScreenTitle } from "./ui/ScreenTitle";
import { TimerDisplay } from "./TimerDisplay"; // 追加: 共通タイマーを呼び出す

type ResultScreenProps = {
  hours?: string;
  minutes?: string;
  seconds?: string;
  enterCount?: number;
  leaveCount?: number;
  onRestart: () => void;
};

export const ResultScreen: React.FC<ResultScreenProps> = ({
  hours = "00",
  minutes = "12",
  seconds = "02",
  enterCount = 2,
  leaveCount = 2,
  onRestart,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* メイン画面と高さを揃えるための固定ヘッダーエリア */}
      <div
        style={{
          height: "70px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: "8px",
          boxSizing: "border-box",
        }}
      >
        <ScreenTitle>お疲れさまでした。</ScreenTitle>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* 上部カード: メイン画面のタイマーと同じ位置に配置 */}
        <GlassCard
          style={{
            padding: "24px 20px",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          {/* ここで WorkingScreen と同じ TimerDisplay を使い回す（isStealth は不要なので渡さない） */}
          <TimerDisplay hours={hours} minutes={minutes} seconds={seconds} />

          <span
            style={{
              fontSize: "12px",
              color: "#64748b",
              margin: "4px 0 20px 0",
              letterSpacing: "0.05em",
            }}
          >
            作業時間
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 4L3.8 7L9 1"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}
            >
              集中バースト完了
            </span>
          </div>
        </GlassCard>

        {/* 下部カード: 入退室人数 */}
        <GlassCard
          style={{
            padding: "20px 16px",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <div style={{ color: "#0f172a" }}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  marginBottom: "2px",
                }}
              >
                入室人数
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                {enterCount}人
              </div>
            </div>
          </div>
          <div
            style={{ width: "1px", height: "44px", backgroundColor: "#e2e8f0" }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <div style={{ color: "#ef4444" }}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  marginBottom: "2px",
                }}
              >
                退出人数
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                {leaveCount}人
              </div>
            </div>
          </div>
        </GlassCard>

        <p
          style={{
            fontSize: "13px",
            color: "#64748b",
            margin: "32px 0 0 0",
            letterSpacing: "0.02em",
          }}
        >
          ひと息ついて、次の集中へ。
        </p>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ width: "100%", paddingBottom: "16px" }}>
        <PrimaryButton onClick={onRestart}>もう一度集中する</PrimaryButton>
      </div>
    </div>
  );
};
