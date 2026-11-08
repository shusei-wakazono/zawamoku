import React, { useState } from "react";
import { TimerDisplay } from "./TimerDisplay";
import { CapsuleToolbar } from "./CapsuleToolbar";
import { EndConfirmModal } from "./EndConfirmModal";
import { PrimaryButton } from "./ui/PrimaryButton";
import {
  clearPauseState,
  useTimestampTimer,
} from "../hooks/useTimestampTimer";
import { formatDuration } from "../utils/formatDuration";

type WorkingScreenProps = {
  /** 作業開始時のタイムスタンプ (ms, Date.now() の値) */
  startTime: number;
  /** 作業終了時に、確定した経過ミリ秒を親へ渡す */
  onEnd: (elapsedMs: number) => void;
};

export const WorkingScreen: React.FC<WorkingScreenProps> = ({
  startTime,
  onEnd,
}) => {
  const [isStealth, setIsStealth] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const { elapsedMs, getElapsedMs, isPaused, togglePause } =
    useTimestampTimer(startTime);
  const { hours, minutes, seconds } = formatDuration(elapsedMs);

  const toggleStealth = () => {
    setIsStealth((prev) => !prev);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 上部余白スペーサー (比率を広げて中央要素を少し下へシフト) */}
      <div style={{ flex: 1.2 }} />

      {/* 中央エリア: 作業中ラベル / タイマー / カプセルバー */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {/* 作業中ラベル */}
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#475569",
            marginBottom: "8px",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>{isPaused ? "一時停止中" : "作業中"}</span>
          <span style={{ fontSize: "14px" }}>
            {isPaused ? "⏸" : isStealth ? "☕️" : "🔥"}
          </span>
        </div>

        {/* タイマー / ダッシュ表示 */}
        <TimerDisplay
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          isStealth={isStealth}
        />

        {/* コントロールバー */}
        <CapsuleToolbar
          isStealth={isStealth}
          isPaused={isPaused}
          onTogglePause={togglePause}
          onToggleVisibility={toggleStealth}
        />
      </div>

      {/* 下部余白スペーサー */}
      <div style={{ flex: 1 }} />

      {/* 作業終了ボタン */}
      <div style={{ paddingBottom: "16px", width: "100%" }}>
        <PrimaryButton onClick={() => setIsConfirmOpen(true)}>
          作業を終了する
        </PrimaryButton>
      </div>

      {/* 終了確認ダイアログ */}
      <EndConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={() => {
          setIsConfirmOpen(false);
          // 表示中の値ではなく、確定時点の時刻から正確に算出して渡す
          const finalElapsedMs = getElapsedMs();
          clearPauseState();
          onEnd(finalElapsedMs);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
