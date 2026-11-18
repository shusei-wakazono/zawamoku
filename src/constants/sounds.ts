// public/sounds 内のモノラル（1ch）音声。Vite のベースパスに対応する。
export const SOUND_PATHS = [
  `${import.meta.env.BASE_URL}sounds/book1.wav`,
  `${import.meta.env.BASE_URL}sounds/book2.wav`,
  `${import.meta.env.BASE_URL}sounds/life.wav`,
  `${import.meta.env.BASE_URL}sounds/pull.wav`,
  `${import.meta.env.BASE_URL}sounds/rub.wav`,
  `${import.meta.env.BASE_URL}sounds/pen_mono.wav`,
] as const;

export type SoundPath = (typeof SOUND_PATHS)[number];
