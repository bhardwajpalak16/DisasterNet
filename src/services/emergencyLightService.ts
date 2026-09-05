export type LightMode =
  | 'solid'
  | 'strobe-rapid'
  | 'strobe-warning'
  | 'sos'
  | 'pulse'
  | 'hazard-police';

export type LightColor = 'white' | 'amber' | 'red' | 'blue' | 'green';

export interface LightState {
  isActive: boolean;
  mode: LightMode;
  color: LightColor;
  brightness: number; // 0.1 to 1.0
  hardwareTorchAvailable: boolean;
  hardwareTorchActive: boolean;
  isIlluminated: boolean; // Current flashing phase for screen
}

type LightListener = (state: LightState) => void;

class EmergencyLightService {
  private state: LightState = {
    isActive: false,
    mode: 'solid',
    color: 'white',
    brightness: 1.0,
    hardwareTorchAvailable: false,
    hardwareTorchActive: false,
    isIlluminated: true,
  };

  private listeners: Set<LightListener> = new Set();
  private flashTimer: number | null = null;
  private mediaStream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;

  constructor() {
    this.checkHardwareTorch();
  }

  private async checkHardwareTorch() {
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      ) {
        // Supported API check
        this.state.hardwareTorchAvailable = true;
        this.notify();
      }
    } catch {
      this.state.hardwareTorchAvailable = false;
    }
  }

  public subscribe(listener: LightListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((fn) => fn(copy));
  }

  public getState(): LightState {
    return { ...this.state };
  }

  public toggleLight(mode?: LightMode, color?: LightColor): boolean {
    if (this.state.isActive) {
      this.stopLight();
      return false;
    } else {
      this.startLight(mode, color);
      return true;
    }
  }

  public startLight(mode?: LightMode, color?: LightColor) {
    if (mode) this.state.mode = mode;
    if (color) this.state.color = color;
    this.state.isActive = true;
    this.state.isIlluminated = true;

    this.startFlashLoop();
    this.notify();
  }

  public stopLight() {
    this.stopFlashLoop();
    this.state.isActive = false;
    this.state.isIlluminated = false;
    this.turnOffHardwareTorch();
    this.notify();
  }

  public setMode(mode: LightMode) {
    this.state.mode = mode;
    if (this.state.isActive) {
      this.startFlashLoop();
    }
    this.notify();
  }

  public setColor(color: LightColor) {
    this.state.color = color;
    this.notify();
  }

  public setBrightness(val: number) {
    this.state.brightness = Math.max(0.1, Math.min(1.0, val));
    this.notify();
  }

  public async toggleHardwareTorch(): Promise<boolean> {
    if (this.state.hardwareTorchActive) {
      this.turnOffHardwareTorch();
      return false;
    } else {
      const ok = await this.turnOnHardwareTorch();
      return ok;
    }
  }

  public async turnOnHardwareTorch(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
      }

      const track = this.mediaStream.getVideoTracks()[0];
      if (!track) return false;

      // Check capabilities
      const capabilities = (track.getCapabilities && (track.getCapabilities() as any)) || {};
      if ('torch' in capabilities) {
        await (track as any).applyConstraints({
          advanced: [{ torch: true }],
        });
        this.videoTrack = track;
        this.state.hardwareTorchActive = true;
        this.state.hardwareTorchAvailable = true;
        this.notify();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Hardware torch unavailable in current browser/frame', e);
      this.state.hardwareTorchActive = false;
      this.notify();
      return false;
    }
  }

  public turnOffHardwareTorch() {
    try {
      if (this.videoTrack) {
        (this.videoTrack as any).applyConstraints({
          advanced: [{ torch: false }],
        }).catch(() => {});
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
        this.videoTrack = null;
      }
    } catch {}
    this.state.hardwareTorchActive = false;
    this.notify();
  }

  private stopFlashLoop() {
    if (this.flashTimer) {
      window.clearTimeout(this.flashTimer);
      this.flashTimer = null;
    }
  }

  private startFlashLoop() {
    this.stopFlashLoop();

    if (!this.state.isActive) return;

    if (this.state.mode === 'solid') {
      this.state.isIlluminated = true;
      this.notify();
      return;
    }

    if (this.state.mode === 'strobe-rapid') {
      // 8 Hz Rescue Strobe: 62.5ms cycle
      const interval = 65;
      const loop = () => {
        if (!this.state.isActive) return;
        this.state.isIlluminated = !this.state.isIlluminated;
        this.notify();
        this.flashTimer = window.setTimeout(loop, interval);
      };
      this.flashTimer = window.setTimeout(loop, interval);
      return;
    }

    if (this.state.mode === 'strobe-warning') {
      // 4 Hz Warning Strobe: 125ms cycle
      const interval = 125;
      const loop = () => {
        if (!this.state.isActive) return;
        this.state.isIlluminated = !this.state.isIlluminated;
        this.notify();
        this.flashTimer = window.setTimeout(loop, interval);
      };
      this.flashTimer = window.setTimeout(loop, interval);
      return;
    }

    if (this.state.mode === 'pulse') {
      // Smooth 1Hz pulse (handled visually via CSS/state)
      this.state.isIlluminated = true;
      this.notify();
      return;
    }

    if (this.state.mode === 'hazard-police') {
      // Alternates Red / Blue
      const interval = 160;
      let toggle = false;
      const loop = () => {
        if (!this.state.isActive) return;
        toggle = !toggle;
        this.state.color = toggle ? 'red' : 'blue';
        this.state.isIlluminated = true;
        this.notify();
        this.flashTimer = window.setTimeout(loop, interval);
      };
      this.flashTimer = window.setTimeout(loop, interval);
      return;
    }

    if (this.state.mode === 'sos') {
      // Morse Code: ... --- ...
      // dot: 120ms, dash: 360ms, intra-element: 120ms, letter-space: 360ms, word-space: 800ms
      const sequence: { on: boolean; dur: number }[] = [
        // S (...)
        { on: true, dur: 120 },
        { on: false, dur: 100 },
        { on: true, dur: 120 },
        { on: false, dur: 100 },
        { on: true, dur: 120 },
        { on: false, dur: 320 }, // letter space
        // O (---)
        { on: true, dur: 360 },
        { on: false, dur: 100 },
        { on: true, dur: 360 },
        { on: false, dur: 100 },
        { on: true, dur: 360 },
        { on: false, dur: 320 }, // letter space
        // S (...)
        { on: true, dur: 120 },
        { on: false, dur: 100 },
        { on: true, dur: 120 },
        { on: false, dur: 100 },
        { on: true, dur: 120 },
        { on: false, dur: 850 }, // word space before repeat
      ];

      let step = 0;
      const runSosStep = () => {
        if (!this.state.isActive) return;
        const cur = sequence[step];
        this.state.isIlluminated = cur.on;
        this.notify();

        step = (step + 1) % sequence.length;
        this.flashTimer = window.setTimeout(runSosStep, cur.dur);
      };

      runSosStep();
    }
  }
}

export const emergencyLight = new EmergencyLightService();
