import { useCallback, useEffect, useState } from "react";

/** 描画更新の周期 (ms)。秒表示の更新遅れを最大 0.5 秒に抑える */
const TICK_INTERVAL_MS = 500;

/**
 * タイムスタンプ方式のタイマー。
 *
 * @param startTime 作業開始時のタイムスタンプ (ms, Date.now() の値)
 */
export const useTimestampTimer = (startTime: number) => {
  /** 現在時刻から経過ミリ秒を算出する (終了時の確定値取得にも使う) */
  const getElapsedMs = useCallback(
    () => Math.max(0, Date.now() - startTime),
    [startTime],
  );

  // 初回描画時点で差分を計算しておく (遅延初期化)
  const [elapsedMs, setElapsedMs] = useState<number>(getElapsedMs);

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

    // アンマウント時にタイマーとリスナーを解除
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [getElapsedMs]);

  return { elapsedMs, getElapsedMs };
};
