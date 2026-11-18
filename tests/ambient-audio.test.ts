import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AmbientAudio } from '../src/audio/AmbientAudio';

const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
class Param {
  value = 0;
  cancelAndHoldAtTime = vi.fn();
  cancelScheduledValues = vi.fn();
  setValueAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
}
class Node {
  gain = new Param();
  positionX = new Param();
  positionZ = new Param();
  buffer = null;
  loop = false;
  connect = vi.fn((node: Node) => node);
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}
class Context extends EventTarget {
  static instances: Context[] = [];
  state = 'suspended';
  currentTime = 10;
  destination = new Node();
  gains: Node[] = [];
  sources: Node[] = [];
  panners: Node[] = [];
  constructor() { super(); Context.instances.push(this); }
  change(state: string) { this.state = state; this.dispatchEvent(new Event('statechange')); }
  resume = vi.fn(async () => { this.change('running'); });
  close = vi.fn(async () => { this.state = 'closed'; });
  decodeAudioData = vi.fn(async () => ({ duration: 5 }));
  createGain() { const node = new Node(); this.gains.push(node); return node; }
  createBufferSource() { const node = new Node(); this.sources.push(node); return node; }
  createPanner() { const node = new Node(); this.panners.push(node); return node; }
}
class Session extends EventTarget {
  state = 'active';
  change(state: string) { this.state = state; this.dispatchEvent(new Event('statechange')); }
}
const response = () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
let audio: AmbientAudio;
let session: Session;
let doc: EventTarget & { visibilityState: string };
let win: EventTarget;
const context = () => Context.instances.at(-1)!;
const master = () => context().gains[0].gain;

beforeEach(() => {
  Context.instances = [];
  session = new Session();
  doc = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  win = new EventTarget();
  vi.stubGlobal('AudioContext', Context);
  vi.stubGlobal('navigator', { audioSession: session });
  vi.stubGlobal('document', doc);
  vi.stubGlobal('window', win);
  vi.stubGlobal('fetch', vi.fn(async () => response()));
  audio = new AmbientAudio();
});
afterEach(() => { audio.stop(); vi.unstubAllGlobals(); });

const start = async () => { audio.start(); await settle(); expect(audio.getSnapshot()).toBe('playing'); };

describe('environmental audio lifecycle', () => {
  it('unlocks audio synchronously, loads all sounds and starts one spatial graph', async () => {
    audio.start();
    expect(context().resume).toHaveBeenCalledTimes(1);
    expect(audio.getSnapshot()).toBe('loading');
    await settle();
    expect(context().sources).toHaveLength(6);
    expect(context().panners).toHaveLength(6);
    expect(context().sources.every(source => source.loop)).toBe(true);
    expect(master().linearRampToValueAtTime).toHaveBeenLastCalledWith(0.65, 11);
    audio.start(); await settle();
    expect(Context.instances).toHaveLength(1);
    expect(context().sources).toHaveLength(6);
  });
  it('mutes on interruption and fades back without rebuilding positions or sources', async () => {
    await start();
    const sources = [...context().sources];
    context().change('interrupted');
    expect(audio.getSnapshot()).toBe('interrupted');
    expect(master().linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 10);
    context().change('running');
    expect(audio.getSnapshot()).toBe('playing');
    expect(master().linearRampToValueAtTime).toHaveBeenLastCalledWith(0.65, 11);
    expect(context().sources).toEqual(sources);
  });
  it('recovers when the browser transitions from interrupted to suspended', async () => {
    await start();
    context().change('interrupted');
    context().change('suspended');
    await settle();
    expect(context().resume).toHaveBeenCalledTimes(2);
    expect(audio.getSnapshot()).toBe('playing');
  });
  it('respects audio-session interruptions even when context remains running', async () => {
    await start();
    session.change('interrupted');
    expect(audio.getSnapshot()).toBe('interrupted');
    win.dispatchEvent(new Event('focus'));
    expect(context().resume).toHaveBeenCalledTimes(1);
    session.change('active'); await settle();
    expect(audio.getSnapshot()).toBe('playing');
  });
  it('does not auto-resume after user pauses during an interruption', async () => {
    await start();
    context().change('interrupted');
    audio.pause();
    context().change('suspended');
    session.change('active');
    win.dispatchEvent(new Event('focus'));
    await settle();
    expect(audio.getSnapshot()).toBe('paused');
    expect(context().resume).toHaveBeenCalledTimes(1);
    audio.start(); await settle();
    expect(audio.getSnapshot()).toBe('playing');
  });
  it('offers manual retry after automatic resume is rejected', async () => {
    await start();
    context().change('suspended');
    context().resume.mockRejectedValueOnce(new Error('NotAllowedError'));
    win.dispatchEvent(new Event('focus')); await settle();
    expect(audio.getSnapshot()).toBe('blocked');
    audio.start(); await settle();
    expect(audio.getSnapshot()).toBe('playing');
  });
  it('keeps playback on page hide and recovers only on visible page', async () => {
    await start();
    doc.visibilityState = 'hidden';
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(audio.getSnapshot()).toBe('playing');
    context().change('suspended');
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(context().resume).toHaveBeenCalledTimes(1);
    doc.visibilityState = 'visible';
    doc.dispatchEvent(new Event('visibilitychange')); await settle();
    expect(audio.getSnapshot()).toBe('playing');
  });
  it('cleans up sources and listeners on stop', async () => {
    await start();
    const old = context();
    audio.stop();
    expect(old.close).toHaveBeenCalledTimes(1);
    old.sources.forEach(source => {
      expect(source.stop).toHaveBeenCalledTimes(1);
      expect(source.disconnect).toHaveBeenCalledTimes(1);
    });
    old.change('running'); session.change('active'); win.dispatchEvent(new Event('focus'));
    expect(audio.getSnapshot()).toBe('idle');
  });
  it('handles failed fetch and retries with a fresh context', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 404 } as Response);
    audio.start(); await settle();
    expect(audio.getSnapshot()).toBe('error');
    expect(context().close).toHaveBeenCalledTimes(1);
    await start();
    expect(Context.instances).toHaveLength(2);
  });
  it('ignores stale loading completion after stop and restart', async () => {
    const request = deferred<ReturnType<typeof response>>();
    vi.mocked(fetch).mockReturnValueOnce(request.promise as Promise<Response>);
    audio.start();
    const old = context();
    audio.stop(); await start();
    request.resolve(response()); await settle();
    expect(old.sources).toHaveLength(0);
    expect(context().sources).toHaveLength(6);
    expect(audio.getSnapshot()).toBe('playing');
  });
  it('does not start audible playback when paused during loading', async () => {
    const request = deferred<ReturnType<typeof response>>();
    vi.mocked(fetch).mockReturnValueOnce(request.promise as Promise<Response>);
    audio.start(); audio.pause();
    request.resolve(response()); await settle();
    expect(audio.getSnapshot()).toBe('paused');
    expect(master().linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 10.15);
  });
  it('ignores an old automatic recovery rejection after a new session starts', async () => {
    await start();
    const pending = deferred<void>();
    context().change('suspended');
    context().resume.mockReturnValueOnce(pending.promise);
    win.dispatchEvent(new Event('focus'));
    audio.stop(); await start();
    pending.reject(new Error('old context closed')); await settle();
    expect(audio.getSnapshot()).toBe('playing');
  });
});
