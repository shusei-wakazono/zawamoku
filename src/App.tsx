import { useState } from "react";
import { GradientContainer } from "./components/ui/GradientContainer";
import { StartScreen } from "./components/StartScreen";
import { WorkingScreen } from "./components/WorkingScreen";
import { ResultScreen } from "./components/ResultScreen";
import { formatDuration } from "./utils/formatDuration";

// 【追加ポイント1】ストレージ保存用のキー名
const STORAGE_KEY_START_TIME = "zawamoku_start_time";

export default function App() {
  // 【追加ポイント2】初回起動・リロード時に前回の作業データを復元する
  const [startTime, setStartTime] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_START_TIME);
    if (!saved) return 0;
    const parsed = Number(saved);
    // 24時間以上放置された古いデータでなければ復元
    if (!isNaN(parsed) && Date.now() - parsed < 24 * 60 * 60 * 1000) {
      return parsed;
    }
    localStorage.removeItem(STORAGE_KEY_START_TIME);
    return 0;
  });

  // 保存データがあれば初期画面を 'working' にして復帰
  const [appState, setAppState] = useState<"start" | "working" | "result">(
    () => {
      const saved = localStorage.getItem(STORAGE_KEY_START_TIME);
      if (!saved) return "start";
      const parsed = Number(saved);
      if (!isNaN(parsed) && Date.now() - parsed < 24 * 60 * 60 * 1000) {
        return "working";
      }
      return "start";
    },
  );

  const [workDurationMs, setWorkDurationMs] = useState<number>(0);
  const workDuration = formatDuration(workDurationMs);

  // 【追加ポイント3】画面遷移ごとのストレージ管理
  const handleStart = () => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY_START_TIME, String(now));
    setStartTime(now);
    setAppState("working");
  };

  const handleEnd = (elapsedMs: number) => {
    localStorage.removeItem(STORAGE_KEY_START_TIME);
    setWorkDurationMs(elapsedMs);
    setAppState("result");
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY_START_TIME);
    setStartTime(0);
    setAppState("start");
  };

  return (
    <GradientContainer>
      {appState === "start" && <StartScreen onStart={handleStart} />}

      {appState === "working" && (
        <WorkingScreen startTime={startTime} onEnd={handleEnd} />
      )}

      {appState === "result" && (
        <ResultScreen
          hours={workDuration.hours}
          minutes={workDuration.minutes}
          seconds={workDuration.seconds}
          onRestart={handleRestart}
        />
      )}
    </GradientContainer>
  );
}
