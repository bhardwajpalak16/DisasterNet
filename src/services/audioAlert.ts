export type SirenMode = 'hi-lo' | 'wail' | 'yelp' | 'piercing';

type SirenListener = (isActive: boolean, mode: SirenMode) => void;

class EmergencyAudioService {
  private ctx: AudioContext | null = null;
  private isSirenActive = false;
  private currentMode: SirenMode = 'hi-lo';
  private masterVolume = 0.55;

  // Active audio nodes for siren
  private sirenNodes: {
    osc1?: OscillatorNode;
    osc2?: OscillatorNode;
    lfo?: OscillatorNode;
    gain?: GainNode;
    timerInterval?: number;
  } = {};

  private listeners: Set<SirenListener> = new Set();

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public subscribe(listener: SirenListener): () => void {
    this.listeners.add(listener);
    listener(this.isSirenActive, this.currentMode);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isSirenActive, this.currentMode));
  }

  public getSirenMode(): SirenMode {
    return this.currentMode;
  }

  public setSirenMode(mode: SirenMode) {
    this.currentMode = mode;
    if (this.isSirenActive) {
      this.stopSiren(false);
      this.startSiren(mode);
    } else {
      this.notify();
    }
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0.05, Math.min(1.0, vol));
    if (this.sirenNodes.gain && this.ctx) {
      this.sirenNodes.gain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public isSirenOn(): boolean {
    return this.isSirenActive;
  }

  public toggleSiren(mode?: SirenMode): boolean {
    if (this.isSirenActive) {
      this.stopSiren();
      return false;
    } else {
      return this.startSiren(mode);
    }
  }

  public startSiren(mode?: SirenMode): boolean {
    try {
      this.initContext();
      if (!this.ctx) return false;

      // Ensure clean synchronous reset of any previous siren
      this.stopSiren(false);

      if (mode) this.currentMode = mode;
      this.isSirenActive = true;
      const now = this.ctx.currentTime;

      // Master output gain
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.masterVolume, now);
      masterGain.connect(this.ctx.destination);

      if (this.currentMode === 'wail') {
        // Classic Sweeping Emergency Wail (550Hz to 1100Hz)
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(600, now);
        osc1.connect(masterGain);

        let sweepingUp = true;
        const intervalId = window.setInterval(() => {
          if (!this.ctx || !this.isSirenActive || !this.sirenNodes.osc1) return;
          const t = this.ctx.currentTime;
          sweepingUp = !sweepingUp;
          const targetFreq = sweepingUp ? 1150 : 550;
          try {
            osc1.frequency.cancelScheduledValues(t);
            osc1.frequency.linearRampToValueAtTime(targetFreq, t + 1.2);
          } catch {}
        }, 1200);

        osc1.start(now);
        this.sirenNodes = { osc1, gain: masterGain, timerInterval: intervalId };
      } else if (this.currentMode === 'yelp') {
        // Fast Tactical Yelp (Rapid alternating pitch)
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(750, now);
        osc1.connect(masterGain);

        let yelpUp = true;
        const intervalId = window.setInterval(() => {
          if (!this.ctx || !this.isSirenActive || !this.sirenNodes.osc1) return;
          const t = this.ctx.currentTime;
          yelpUp = !yelpUp;
          const targetFreq = yelpUp ? 1200 : 750;
          try {
            osc1.frequency.cancelScheduledValues(t);
            osc1.frequency.linearRampToValueAtTime(targetFreq, t + 0.25);
          } catch {}
        }, 250);

        osc1.start(now);
        this.sirenNodes = { osc1, gain: masterGain, timerInterval: intervalId };
      } else if (this.currentMode === 'piercing') {
        // High-Decibel SAR Alarm (dual piercing tones)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(1100, now);
        osc2.frequency.setValueAtTime(1450, now);

        osc1.connect(masterGain);
        osc2.connect(masterGain);

        let toggle = false;
        const intervalId = window.setInterval(() => {
          if (!this.ctx || !this.isSirenActive) return;
          const t = this.ctx.currentTime;
          toggle = !toggle;
          try {
            osc1.frequency.setValueAtTime(toggle ? 1300 : 1000, t);
            osc2.frequency.setValueAtTime(toggle ? 1650 : 1250, t);
          } catch {}
        }, 180);

        osc1.start(now);
        osc2.start(now);
        this.sirenNodes = { osc1, osc2, gain: masterGain, timerInterval: intervalId };
      } else {
        // Default: Two-Tone Hi-Lo Rescue Horn (Classic ambulance/police 700Hz <-> 960Hz)
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(700, now);
        osc1.connect(masterGain);

        let isHighTone = false;
        const intervalId = window.setInterval(() => {
          if (!this.ctx || !this.isSirenActive || !this.sirenNodes.osc1) return;
          const t = this.ctx.currentTime;
          isHighTone = !isHighTone;
          const freq = isHighTone ? 960 : 700;
          try {
            osc1.frequency.cancelScheduledValues(t);
            osc1.frequency.setValueAtTime(freq, t);
          } catch {}
        }, 500);

        osc1.start(now);
        this.sirenNodes = { osc1, gain: masterGain, timerInterval: intervalId };
      }

      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to start siren:', e);
      this.isSirenActive = false;
      this.notify();
      return false;
    }
  }

  public stopSiren(notify = true) {
    if (this.sirenNodes.timerInterval) {
      clearInterval(this.sirenNodes.timerInterval);
      this.sirenNodes.timerInterval = undefined;
    }

    try {
      if (this.sirenNodes.osc1) {
        this.sirenNodes.osc1.stop();
        this.sirenNodes.osc1.disconnect();
      }
      if (this.sirenNodes.osc2) {
        this.sirenNodes.osc2.stop();
        this.sirenNodes.osc2.disconnect();
      }
      if (this.sirenNodes.lfo) {
        this.sirenNodes.lfo.stop();
        this.sirenNodes.lfo.disconnect();
      }
      if (this.sirenNodes.gain) {
        this.sirenNodes.gain.disconnect();
      }
    } catch {}

    this.sirenNodes = {};
    this.isSirenActive = false;
    if (notify) this.notify();
  }

  public playAlertTone(type: 'critical' | 'high' | 'ping' | 'sos') {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'critical') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.45);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'high') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(1050, now + 0.2);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'ping') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {}
  }

  public playMorseCodeSOS(onComplete?: () => void) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const dot = 0.1;
      const dash = 0.3;
      const intra = 0.1;
      const inter = 0.22;

      const timings = [
        dot, intra, dot, intra, dot, inter,
        dash, intra, dash, intra, dash, inter,
        dot, intra, dot, intra, dot,
      ];

      let t = this.ctx.currentTime + 0.05;
      let isBeep = true;

      timings.forEach((duration) => {
        if (isBeep && this.ctx) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(950, t);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.setValueAtTime(0.001, t + duration - 0.01);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + duration);
        }
        t += duration;
        isBeep = !isBeep;
      });

      if (onComplete) {
        setTimeout(onComplete, (t - this.ctx.currentTime) * 1000);
      }
    } catch {}
  }
}

export const emergencyAudio = new EmergencyAudioService();
