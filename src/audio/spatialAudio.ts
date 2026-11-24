/** 原点はリスナー。+x は右、+y は上、-z は正面。 */
export type SpatialPosition = { x: number; y: number; z: number };

type Status = "idle" | "starting" | "playing" | "paused" | "interrupted" | "error";

export class SpatialAudio {
  private graph?: { context: AudioContext; master: GainNode };
  private pendingSounds = new AbortController();
  private buffers = new Map<string, AudioBuffer>();
  private status: Status = "idle";
  private listeners = new Set<() => void>();
  private volume = 1;
  private muted = false;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  getSnapshot = () => this.status;

  private publish(status: Status) {
    if (this.status === status) return;
    this.status = status;
    this.listeners.forEach((listener) => listener());
  }

  private updateGain() {
    const graph = this.graph;
    if (graph) {
      graph.master.gain.setTargetAtTime(
        this.muted ? 0 : this.volume, graph.context.currentTime, 0.01,
      );
    }
  }

  setMuted = (muted: boolean) => {
    this.muted = muted;
    this.updateGain();
  };

  setVolume = (volume: number) => {
    if (!Number.isFinite(volume)) return;
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateGain();
  };

  private createGraph() {
    const context = new AudioContext();
    const master = context.createGain();
    this.graph = { context, master };
    master.gain.value = this.muted ? 0 : this.volume;
    master.connect(context.destination);
    context.onstatechange = () => {
      if (this.graph?.context === context && this.status === "playing" && context.state !== "running") {
        this.pause();
        this.publish("interrupted");
      }
    };

    // AudioListener の既定値は原点、正面 -z、上 +y。
    const buffer = context.createBuffer(1, context.sampleRate * 8, context.sampleRate);
    const samples = buffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < samples.length; i++) {
      previous = (previous + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      samples[i] = previous * 3.5;
    }
    // ループ境界で波形が急に飛ばないよう、両端を短くフェードする。
    const fadeLength = Math.round(context.sampleRate * 0.02);
    for (let i = 0; i < fadeLength; i++) {
      const fade = i / fadeLength;
      samples[i] *= fade;
      samples[samples.length - 1 - i] *= fade;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 450;
    filter.Q.value = 0;
    const level = context.createGain();
    level.gain.value = 0.15;
    source.connect(filter).connect(level).connect(master);
    source.start();
    return this.graph;
  }

  /** ユーザーのクリック処理から直接呼ぶ。 */
  start = async () => {
    if (this.status === "starting" || this.status === "playing") return;
    this.publish("starting");
    const signal = this.pendingSounds.signal;
    try {
      const { context } = this.graph ?? this.createGraph();
      await context.resume();
      if (!signal.aborted) this.publish(context.state === "running" ? "playing" : "error");
    } catch {
      if (!signal.aborted) {
        this.stop();
        this.publish("error");
      }
    }
  };

  private cancelPendingSounds() {
    this.pendingSounds.abort();
    this.pendingSounds = new AbortController();
  }

  pause = () => {
    const graph = this.graph;
    if (!graph || this.status === "paused" || this.status === "interrupted") return;
    this.cancelPendingSounds();
    this.publish("paused");
    void graph.context.suspend().catch(() => {
      if (this.graph === graph && this.status === "paused") {
        this.stop();
        this.publish("error");
      }
    });
  };

  stop = () => {
    this.cancelPendingSounds();
    this.buffers.clear();
    const graph = this.graph;
    this.graph = undefined;
    if (graph) {
      graph.context.onstatechange = null;
      graph.master.disconnect();
      void graph.context.close().catch(() => {});
    }
    this.publish("idle");
  };

  /** 使用できる状態で再生を開始できた場合は true を返す。 */
  playSpatialSound = async (url: string, { x, y, z }: SpatialPosition) => {
    const graph = this.graph;
    if (!graph || this.status !== "playing" || graph.context.state !== "running") return false;
    const { context, master } = graph;
    const signal = this.pendingSounds.signal;
    try {
      let buffer = this.buffers.get(url);
      if (!buffer) {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`音源の読み込みに失敗しました (${response.status})`);
        const bytes = await response.arrayBuffer();
        if (signal.aborted) return false;
        buffer = await context.decodeAudioData(bytes);
        if (signal.aborted) return false;
        if (buffer.numberOfChannels !== 1) throw new Error("モノラル音源を指定してください");
        this.buffers.set(url, buffer);
      }
      if (context.state !== "running") return false;
      const panner = new PannerNode(context, {
        panningModel: "HRTF", distanceModel: "inverse",
        positionX: x, positionY: y, positionZ: z,
      });
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.onended = () => {
        source.disconnect();
        panner.disconnect();
      };
      source.connect(panner).connect(master);
      source.start();
      return true;
    } catch (error) {
      if (signal.aborted) return false;
      throw error;
    }
  };
}
