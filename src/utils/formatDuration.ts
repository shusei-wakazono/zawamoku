export type DurationParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

const pad2 = (n: number): string => String(n).padStart(2, "0");

/**
 * 経過ミリ秒を 2桁ゼロ埋めの 時・分・秒 文字列に変換する。
 * 100時間以上の場合、時は3桁以上になる。
 */
export const formatDuration = (elapsedMs: number): DurationParts => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  };
};
