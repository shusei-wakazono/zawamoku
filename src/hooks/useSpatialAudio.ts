import { useEffect, useState, useSyncExternalStore } from "react";
import { SpatialAudio } from "../audio/spatialAudio";

export function useSpatialAudio() {
  const [audio] = useState(() => new SpatialAudio());
  const status = useSyncExternalStore(audio.subscribe, audio.getSnapshot);
  useEffect(() => () => audio.stop(), [audio]);
  return { audio, status };
}
