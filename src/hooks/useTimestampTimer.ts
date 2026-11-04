import { useCallback, useEffect, useState } from "react";

/** 描画更新の周期 (ms)。秒表示の更新遅れを最大 0.5 秒に抑える */
const TICK_INTERVAL_MS = 500;

/**
 * タイムスタンプ方式のタイマー。
 */
export const useTimestampTimer = () => {
  // 開始時刻はマウント時に一度だけ記録する (遅延初期化)
  const [startTime] = useState<number>(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  /** 現在時刻から経過ミリ秒を算出する (終了時の確定値取得にも使う) */
  const getElapsedMs = useCallback(() => Date.now() - startTime, [startTime]);

  useEffect(() => {
    const sync = () => setElapsedMs(getElapsedMs());

    // 定期的に差分を再計算して描画へ反映
    const intervalId = window.setInterval(sync, TICK_INTERVAL_MS);

    // タブ復帰・スリープ解除時は次の tick を待たず即座に実時間へ同期
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [getElapsedMs]);

  return { elapsedMs, getElapsedMs };
};
