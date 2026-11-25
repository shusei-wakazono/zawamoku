import React, { useEffect, useState } from "react";
import type { SpatialAudio, SpatialPosition } from "../audio/spatialAudio";
import { TimerDisplay } from "./TimerDisplay";
import { CapsuleToolbar } from "./CapsuleToolbar";
import { EndConfirmModal } from "./EndConfirmModal";
import { PrimaryButton } from "./UI/PrimaryButton";
import {
  clearPauseState,
  useTimestampTimer,
} from "../hooks/useTimestampTimer";
import { formatDuration } from "../utils/formatDuration";

type WorkingScreenProps = {
  audio: SpatialAudio;
  audioStatus: ReturnType<SpatialAudio["getSnapshot"]>;
  /** 作業開始時のタイムスタンプ (ms, Date.now() の値) */
  startTime: number;
  /** 作業終了時に、確定した経過ミリ秒を親へ渡す */
  onEnd: (elapsedMs: number) => void;
};

const PREVIEW_SOUND = `${import.meta.env.BASE_URL}sounds/pen_mono.wav`;
const PREVIEW_POSITIONS: { label: string; position: SpatialPosition }[] = [
  { label: "左手前", position: { x: -1, y: 0, z: -1 } },
  { label: "右手前", position: { x: 1, y: 0, z: -1 } },
  { label: "正面手前", position: { x: 0, y: 0, z: -1 } },
  { label: "正面奥", position: { x: 0, y: 0, z: -5 } },
];

export const WorkingScreen: React.FC<WorkingScreenProps> = ({
  startTime,
  onEnd,
  audio,
  audioStatus,
}) => {
  const [isStealth, setIsStealth] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const { elapsedMs, getElapsedMs, isPaused, togglePause } =
    useTimestampTimer(startTime);
  const { hours, minutes, seconds } = formatDuration(elapsedMs);
  useEffect(() => {
    if (isPaused) audio.pause();
  }, [audio, isPaused]);

  useEffect(() => {
    const pauseAudioForBackground = () => audio.pause();
    const handleVisibility = () => {
      if (document.hidden) pauseAudioForBackground();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("freeze", pauseAudioForBackground);
    window.addEventListener("pagehide", pauseAudioForBackground);
    handleVisibility();
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("freeze", pauseAudioForBackground);
      window.removeEventListener("pagehide", pauseAudioForBackground);
    };
  }, [audio]);

  const audioMessages = {
    idle: "環境音を再生できます",
    starting: "環境音を起動しています…",
    playing: "環境音を再生中",
    paused: "環境音は一時停止中です",
    interrupted: "環境音が中断されました",
    error: "環境音を再生できませんでした。再試行してください",
  };

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
          onTogglePause={() => {
            if (togglePause()) audio.pause();
            else void audio.start();
          }}
          onToggleVisibility={toggleStealth}
        />
        <div style={{ marginTop: "16px", textAlign: "center", color: "#475569", fontSize: "12px" }}>
          <p role="status">{audioMessages[isPaused ? "paused" : audioStatus]}</p>
          {!isPaused && audioStatus !== "playing" && audioStatus !== "starting" && (
            <button type="button" onClick={audio.start} style={{ cursor: "pointer", padding: "8px 16px", borderRadius: "16px", border: "1px solid #cbd5e1", background: "#fff", color: "#334155" }}>
              {audioStatus === "error" ? "環境音を再試行" : "環境音を再生・再開"}
            </button>
          )}
          <button type="button" aria-pressed={isMuted} onClick={() => {
            audio.setMuted(!isMuted);
            setIsMuted(!isMuted);
          }}>
            ミュート
          </button>
          <fieldset disabled={isPaused || isMuted || audioStatus !== "playing"}
            style={{ marginTop: "12px", border: 0 }}>
            <legend>立体音響の試聴（イヤホン推奨）</legend>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
              {PREVIEW_POSITIONS.map(({ label, position }) => (
                <button type="button" key={label} onClick={() => {
                  setPreviewError("");
                  void audio.playSpatialSound(PREVIEW_SOUND, position).catch(() => {
                    setPreviewError("試聴音を再生できませんでした。");
                  });
                }}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          {previewError && <p role="status">{previewError}</p>}
        </div>
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
