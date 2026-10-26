import React, { useState } from "react";
import { GradientContainer } from "./components/ui/GradientContainer";
import { StartScreen } from "./components/StartScreen";
import { WorkingScreen } from "./components/WorkingScreen";
import { ResultScreen } from "./components/ResultScreen";

export default function App() {
  const [appState, setAppState] = useState<"start" | "working" | "result">(
    "start",
  );

  return (
    <GradientContainer>
      {appState === "start" && (
        <StartScreen onStart={() => setAppState("working")} />
      )}
      {appState === "working" && (
        <WorkingScreen onEnd={() => setAppState("result")} />
      )}
      {appState === "result" && (
        <ResultScreen onRestart={() => setAppState("start")} />
      )}
    </GradientContainer>
  );
}
