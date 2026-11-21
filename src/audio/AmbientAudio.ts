import { SOUND_PATHS } from '../constants/sounds';

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'interrupted' | 'blocked' | 'error';
type AudioSession = EventTarget & { state: string };

/** One graph per work session. User intent is separate from browser playback state. */
export class AmbientAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private sources: AudioBufferSourceNode[] = [];
  private wanted = false;
  private generation = 0;
  private loading = false;
  private pendingResume = false;
  private session?: AudioSession;
  private status: Status = 'idle';
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  getSnapshot = () => this.status;
  private publish(status: Status) {
    this.status = status;
    this.listeners.forEach(listener => listener());
  }
  private fade(value: number, seconds: number) {
    if (!this.context || !this.master) return;
    const gain = this.master.gain;
    const now = this.context.currentTime;
    // Preserve the current envelope when another interruption arrives mid-fade.
    if (typeof gain.cancelAndHoldAtTime === 'function') {
      gain.cancelAndHoldAtTime(now);
    } else {
      const current = gain.value;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(current, now);
    }
    gain.linearRampToValueAtTime(value, now + seconds);
  }
  private interrupted() {
    return (this.context?.state as string) === 'interrupted' || this.session?.state === 'interrupted';
  }
  private onStateChange = () => {
    if (!this.context || !this.wanted || this.loading) return;
    const wasInterrupted = this.status === 'interrupted';
    if (this.interrupted() || this.context.state !== 'running') {
      this.fade(0, 0);
      this.publish('interrupted');
      // Some browsers leave the context suspended when the interruption ends.
      if (wasInterrupted && !this.interrupted()) void this.recover();
    } else {
      this.fade(0.65, 1);
      this.publish('playing');
    }
  };
  private onSessionChange = () => {
    this.onStateChange();
    if (!this.interrupted()) void this.recover();
  };
  private onVisible = () => {
    if (document.visibilityState === 'visible') void this.recover();
  };
  private recover = async () => {
    if (!this.context || !this.wanted || this.loading || this.pendingResume || this.interrupted()) return;
    if (this.context.state === 'running') return;
    const context = this.context;
    const generation = this.generation;
    this.pendingResume = true;
    this.publish('blocked');
    try {
      await context.resume();
      if (generation === this.generation && this.wanted) this.onStateChange();
    } catch {
      if (generation === this.generation && this.wanted) this.publish('blocked');
    } finally {
      if (generation === this.generation) this.pendingResume = false;
    }
  };

  /** Call directly from a click so resume retains browser user activation. */
  start = () => {
    this.wanted = true;
    if (this.context) {
      const context = this.context;
      this.publish(this.loading ? 'loading' : 'blocked');
      void context.resume().then(() => {
        if (this.context === context && !this.loading) this.onStateChange();
      }).catch(() => { if (this.context === context && this.wanted) this.publish('blocked'); });
      return;
    }
    const generation = ++this.generation;
    try {
      const context = new AudioContext();
      this.context = context;
      const master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);
      this.master = master;
      this.session = (navigator as Navigator & { audioSession?: AudioSession }).audioSession;
      context.addEventListener('statechange', this.onStateChange);
      this.session?.addEventListener('statechange', this.onSessionChange);
      document.addEventListener('visibilitychange', this.onVisible);
      window.addEventListener('focus', this.onVisible);
      window.addEventListener('pageshow', this.onVisible);
      this.loading = true;
      this.publish('loading');
      // Resume before fetching: the start button supplies user activation.
      void context.resume().catch(() => {
        if (generation === this.generation && this.wanted) this.publish('blocked');
      });
      void Promise.all(SOUND_PATHS.map(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Audio fetch failed: ${response.status}`);
        return context.decodeAudioData(await response.arrayBuffer());
      })).then(buffers => {
        if (generation !== this.generation) return;
        const when = context.currentTime + 0.05;
        buffers.forEach((buffer, index) => {
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          const panner = context.createPanner();
          panner.panningModel = 'HRTF';
          const angle = index / buffers.length * Math.PI * 2;
          panner.positionX.value = Math.sin(angle) * 2;
          panner.positionZ.value = Math.cos(angle) * 2;
          const level = context.createGain();
          level.gain.value = 1 / buffers.length;
          source.connect(panner).connect(level).connect(master);
          source.start(when);
          this.sources.push(source);
        });
        this.loading = false;
        this.onStateChange();
        void this.recover();
      }).catch(() => {
        if (generation !== this.generation) return;
        this.stop();
        this.publish('error');
      });
    } catch {
      this.stop();
      this.publish('error');
    }
  };
  pause = () => {
    if (!this.wanted) return;
    this.wanted = false;
    this.fade(0, 0.15);
    this.publish('paused');
  };
  resumeIfPaused = () => {
    if (this.status !== 'paused') return;
    this.wanted = true;
    if (this.loading) {
      this.publish('loading');
      return;
    }
    this.onStateChange();
    void this.recover();
  };
  stop = () => {
    this.wanted = false;
    ++this.generation;
    this.loading = false;
    this.pendingResume = false;
    document.removeEventListener('visibilitychange', this.onVisible);
    window.removeEventListener('focus', this.onVisible);
    window.removeEventListener('pageshow', this.onVisible);
    this.session?.removeEventListener('statechange', this.onSessionChange);
    this.context?.removeEventListener('statechange', this.onStateChange);
    this.sources.forEach(source => { source.stop(); source.disconnect(); });
    this.sources = [];
    if (this.context) void this.context.close().catch(() => {});
    this.context = undefined;
    this.master = undefined;
    this.session = undefined;
    this.publish('idle');
  };
}
