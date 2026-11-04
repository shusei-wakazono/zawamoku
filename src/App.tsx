import { useState } from "react";
import { GradientContainer } from "./components/ui/GradientContainer";
import { StartScreen } from "./components/StartScreen";
import { WorkingScreen } from "./components/WorkingScreen";
import { ResultScreen } from "./components/ResultScreen";
import { formatDuration } from "./utils/formatDuration";

export default function App() {
  const [appState, setAppState] = useState<"start" | "working" | "result">(
    "start",
  );
  // 直近の作業時間 (ms)。WorkingScreen の終了時に確定する
  const [workDurationMs, setWorkDurationMs] = useState<number>(0);
  const workDuration = formatDuration(workDurationMs);

  return (
    <GradientContainer>
      {appState === "start" && (
        <StartScreen onStart={() => setAppState("working")} />
      )}
      {appState === "working" && (
        <WorkingScreen
          onEnd={(elapsedMs) => {
            setWorkDurationMs(elapsedMs);
            setAppState("result");
          }}
        />
      )}
      {appState === "result" && (
        <ResultScreen
          hours={workDuration.hours}
          minutes={workDuration.minutes}
          seconds={workDuration.seconds}
          onRestart={() => setAppState("start")}
        />
      )}
    </GradientContainer>
  );
}
