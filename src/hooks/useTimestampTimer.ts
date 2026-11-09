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

/**
 * 同じ startTime の作業セッションで保存された一時停止情報だけを読み出す。
 * 該当データが無い・壊れている場合は null
 */
const readPauseState = (startTime: number): PauseState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAUSE_STATE);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<StoredPauseState>;
    if (
      saved.startTime === startTime &&
      typeof saved.pausedTotalMs === "number" &&
      (saved.pausedAt === null || typeof saved.pausedAt === "number")
    ) {
      return { pausedAt: saved.pausedAt, pausedTotalMs: saved.pausedTotalMs };
    }
  } catch {
    // 壊れたデータは無視する
  }
  return null;
};

/** 保存データが無ければ初期状態から始める */
const loadPauseState = (startTime: number): PauseState =>
  readPauseState(startTime) ?? INITIAL_PAUSE_STATE;

/** 一時停止情報を作業セッション (startTime) と紐付けて保存する */
const savePauseState = (startTime: number, state: PauseState) => {
  const stored: StoredPauseState = { startTime, ...state };
  try {
    localStorage.setItem(STORAGE_KEY_PAUSE_STATE, JSON.stringify(stored));
  } catch {
    // 容量超過・プライベートモード等で保存できなくても計測自体は継続する
  }
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

  /**
   * 一時停止 ⇄ 再開 をトグルする。
   * 別タブで状態が更新されている可能性があるため、操作直前に localStorage の
   * 最新値を基準に次の状態を算出し、古い state による上書き (競合) を防ぐ。
   */
  const togglePause = useCallback(() => {
    const current = Date.now();
    // 保存データが無い (保存失敗・別タブで終了直後など) 場合は手元の state を使う
    const latest = readPauseState(startTime) ?? pauseState;
    const next: PauseState =
      latest.pausedAt === null
        ? // 計測中 → 一時停止: 停止時刻を記録
          { ...latest, pausedAt: current }
        : // 一時停止中 → 再開: 停止していた時間を累積へ加算
          {
            pausedAt: null,
            pausedTotalMs:
              latest.pausedTotalMs + Math.max(0, current - latest.pausedAt),
          };
    // 永続化は操作時のみ同期的に行う (state 経由の effect 書き込みだと、
    // 他タブから同期した値や古い値を書き戻してしまう恐れがあるため)
    savePauseState(startTime, next);
    setPauseState(next);
    // 再開直後に古い now で表示が巻き戻らないよう即座に同期
    setNow(current);
  }, [pauseState, startTime]);

  // 別タブでの一時停止・再開を即時反映する
  // (storage イベントは「他タブ」で localStorage が変更された時のみ発火する)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY_PAUSE_STATE) return;
      // 削除 (= 別タブで作業終了) や別セッションのデータでは停止情報を上書きしない。
      // 初期化すると累積停止時間が失われ、経過時間が跳ね上がるため
      const latest = readPauseState(startTime);
      if (!latest) return;

      setPauseState((prev) =>
        prev.pausedAt === latest.pausedAt &&
        prev.pausedTotalMs === latest.pausedTotalMs
          ? prev // 変化なしなら再描画しない
          : latest,
      );
      setNow(Date.now());
    };

    window.addEventListener("storage", handleStorage);
    // startTime 変更・アンマウント時にリスナーを解除し、古いセッションで同期しない
    return () => window.removeEventListener("storage", handleStorage);
  }, [startTime]);

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
