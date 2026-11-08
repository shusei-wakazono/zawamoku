import { useCallback, useEffect, useState } from "react";

/** 描画更新の周期 (ms)。秒表示の更新遅れを最大 0.5 秒に抑える */
const TICK_INTERVAL_MS = 500;

/** 一時停止状態の保存キー (リロード・タブ破棄後も停止時間を正しく除外するため) */
const STORAGE_KEY_PAUSE_STATE = "zawamoku_pause_state";

type PauseState = {
  /** 一時停止を開始した時刻 (ms)。計測中は null */
  pausedAt: number | null;
  /** 過去の一時停止で累積した停止時間 (ms) */
  pausedTotalMs: number;
};

type StoredPauseState = PauseState & {
  /** どの作業セッションの停止情報かを識別するための開始時刻 */
  startTime: number;
};

const INITIAL_PAUSE_STATE: PauseState = { pausedAt: null, pausedTotalMs: 0 };

/** 同じ startTime の作業セッションで保存された一時停止情報だけを復元する */
const loadPauseState = (startTime: number): PauseState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAUSE_STATE);
    if (!raw) return INITIAL_PAUSE_STATE;
    const saved = JSON.parse(raw) as Partial<StoredPauseState>;
    if (
      saved.startTime === startTime &&
      typeof saved.pausedTotalMs === "number" &&
      (saved.pausedAt === null || typeof saved.pausedAt === "number")
    ) {
      return { pausedAt: saved.pausedAt, pausedTotalMs: saved.pausedTotalMs };
    }
  } catch {
    // 壊れたデータは無視して初期状態から始める
  }
  return INITIAL_PAUSE_STATE;
};

/**
 * タイムスタンプ方式のタイマー (一時停止対応)。
 *
 * 経過時間 = (基準時刻 - 開始時刻) - 累積停止時間
 *   - 基準時刻: 計測中は現在時刻、一時停止中は停止した瞬間の時刻
 *
 * @param startTime 作業開始時のタイムスタンプ (ms, Date.now() の値)
 */
export const useTimestampTimer = (startTime: number) => {
  const [pauseState, setPauseState] = useState<PauseState>(() =>
    loadPauseState(startTime),
  );
  // 描画用の「現在時刻」。計測中のみ定期更新する
  const [now, setNow] = useState<number>(() => Date.now());

  const isPaused = pauseState.pausedAt !== null;

  /** 指定時刻時点の経過ミリ秒を算出する (停止時間は除外) */
  const calcElapsedMs = useCallback(
    (at: number) => {
      const { pausedAt, pausedTotalMs } = pauseState;
      // 一時停止中は停止した瞬間で時間を止める
      const reference = pausedAt ?? at;
      return Math.max(0, reference - startTime - pausedTotalMs);
    },
    [pauseState, startTime],
  );

  /** 現在時刻から経過ミリ秒を算出する (終了時の確定値取得にも使う) */
  const getElapsedMs = useCallback(
    () => calcElapsedMs(Date.now()),
    [calcElapsedMs],
  );

  const elapsedMs = calcElapsedMs(now);

  /** 一時停止 ⇄ 再開 をトグルする */
  const togglePause = useCallback(() => {
    const current = Date.now();
    setPauseState((prev) =>
      prev.pausedAt === null
        ? // 計測中 → 一時停止: 停止時刻を記録
          { ...prev, pausedAt: current }
        : // 一時停止中 → 再開: 停止していた時間を累積へ加算
          {
            pausedAt: null,
            pausedTotalMs: prev.pausedTotalMs + (current - prev.pausedAt),
          },
    );
    // 再開直後に古い now で表示が巻き戻らないよう即座に同期
    setNow(current);
  }, []);

  // 一時停止状態を永続化 (リロード復帰時に停止時間を正しく除外するため)
  useEffect(() => {
    const stored: StoredPauseState = { startTime, ...pauseState };
    localStorage.setItem(STORAGE_KEY_PAUSE_STATE, JSON.stringify(stored));
  }, [pauseState, startTime]);

  useEffect(() => {
    // 一時停止中は表示更新を止める (計測値自体も pausedAt で固定されている)
    if (isPaused) return;

    const sync = () => setNow(Date.now());

    // 定期的に現在時刻を更新して描画へ反映
    const intervalId = window.setInterval(sync, TICK_INTERVAL_MS);

    // タブ復帰・スリープ解除時は次の tick を待たず即座に実時間へ同期
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 停止・アンマウント時にタイマーとリスナーを解除
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPaused]);

  return { elapsedMs, getElapsedMs, isPaused, togglePause };
};

/** 作業終了・リセット時に一時停止情報を破棄する */
export const clearPauseState = () => {
  localStorage.removeItem(STORAGE_KEY_PAUSE_STATE);
};
