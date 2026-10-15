/**
 * Ambient Web Audio Synthesizer for Meher-Negar
 * Provides real-time atmospheric audio cues (Flute/Bansuri, Wind, River, Tanpura, Elegy)
 * Without external MP3 dependencies, guaranteed to play natively and smoothly.
 */

type SoundscapeMode = 'flute' | 'wind' | 'river' | 'tanpura' | 'war' | 'elegy' | 'mute';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentMode: SoundscapeMode = 'flute';
  private isPlaying = false;
  private userVolume = 0.35;
  private isDucked = false;
  private loopInterval: any = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.userVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.userVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      const targetGain = this.isDucked ? this.userVolume * 0.2 : this.userVolume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.userVolume;
  }

  public setDucked(duck: boolean) {
    this.isDucked = duck;
    if (this.ctx && this.masterGain) {
      const targetGain = this.isDucked ? this.userVolume * 0.18 : this.userVolume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
    }
  }

  public start(mode: SoundscapeMode = 'flute') {
    this.initContext();
    this.currentMode = mode;
    this.isPlaying = true;
    this.stopCurrent();
    this.playMode(mode);
  }

  public stop() {
    this.isPlaying = false;
    this.stopCurrent();
  }

  public switchMode(mode: SoundscapeMode) {
    this.currentMode = mode;
    if (this.isPlaying) {
      this.stopCurrent();
      this.playMode(mode);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(this.currentMode);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentMode(): SoundscapeMode {
    return this.currentMode;
  }

  private stopCurrent() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    for (const node of this.activeNodes) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore already stopped nodes
      }
    }
    this.activeNodes = [];
  }

  private playMode(mode: SoundscapeMode) {
    if (!this.ctx || !this.masterGain) return;

    switch (mode) {
      case 'flute':
        this.playMelancholicFlute();
        break;
      case 'wind':
        this.playMountainWind();
        break;
      case 'river':
        this.playRiverJhelum();
        break;
      case 'tanpura':
        this.playTanpuraDrone();
        break;
      case 'war':
        this.playDesertWarSound();
        break;
      case 'elegy':
        this.playElegyPad();
        break;
      case 'mute':
        break;
    }
  }

  // --- 1. Melancholic Indian Bamboo Flute (Bansuri) Simulation ---
  private playMelancholicFlute() {
    if (!this.ctx || !this.masterGain) return;

    // Background soft wind breath
    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    windGain.connect(this.masterGain);
    const noiseNode = this.createNoiseNode(windGain, 400, 1.2);
    this.activeNodes.push(windGain, noiseNode);

    // Melodic notes in Raag Bhairavi / Darbari (in Hz, D4 based)
    // D4 = 293.66, Eb4 = 311.13, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25, D5 = 587.33
    const phrases = [
      [293.66, 311.13, 349.23, 311.13, 293.66],
      [349.23, 392.00, 466.16, 440.00, 392.00, 349.23],
      [466.16, 523.25, 587.33, 523.25, 466.16, 440.00],
      [392.00, 349.23, 311.13, 293.66, 261.63, 293.66],
    ];

    let phraseIdx = 0;

    const playNextPhrase = () => {
      if (!this.ctx || !this.isPlaying || this.currentMode !== 'flute') return;
      const notes = phrases[phraseIdx % phrases.length];
      phraseIdx++;

      let startTime = this.ctx.currentTime + 0.3;
      notes.forEach((freq, i) => {
        const noteDuration = 1.4 + Math.random() * 0.8;
        this.playFluteNote(freq, startTime, noteDuration);
        startTime += noteDuration * 0.85;
      });
    };

    playNextPhrase();
    this.loopInterval = setInterval(playNextPhrase, 9500);
  }

  private playFluteNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Subtle LFO vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(4.6, startTime);
    lfoGain.gain.setValueAtTime(4.5, startTime);
    lfo.connect(osc.frequency);
    lfo.connect(osc2.frequency);

    // Warm, breathy timbre
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // 1st harmonic octave

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.15, startTime);
    osc2.connect(osc2Gain);

    // Low pass filter to soften
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, startTime);
    filter.Q.setValueAtTime(2.0, startTime);

    // Envelope: slow graceful swell & breathy decay
    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.24, startTime + duration * 0.35);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    osc2Gain.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    lfo.start(startTime);
    osc.start(startTime);
    osc2.start(startTime);

    lfo.stop(startTime + duration + 0.1);
    osc.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);

    this.activeNodes.push(osc, osc2, lfo, noteGain, filter);
  }

  // --- 2. Mountain Wind (Waziristan & Graveyard Breeze) ---
  private playMountainWind() {
    if (!this.ctx || !this.masterGain) return;

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    windGain.connect(this.masterGain);

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter1.Q.setValueAtTime(3.5, this.ctx.currentTime);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(800, this.ctx.currentTime);

    // Modulate wind frequency slowly
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter1.frequency);

    const noise = this.createNoiseNode(filter1, 0, 0);
    filter1.connect(filter2);
    filter2.connect(windGain);

    lfo.start();
    this.activeNodes.push(windGain, filter1, filter2, lfo, noise);
  }

  // --- 3. River Jhelum (Flowing Water & Soft Ripples) ---
  private playRiverJhelum() {
    if (!this.ctx || !this.masterGain) return;

    const riverGain = this.ctx.createGain();
    riverGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    riverGain.connect(this.masterGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(550, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.35, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const noise = this.createNoiseNode(filter, 0, 0);
    filter.connect(riverGain);

    lfo.start();
    this.activeNodes.push(riverGain, filter, lfo, noise);
  }

  // --- 4. Classical Tanpura Drone (Sa-Pa-Sa-Sa) ---
  private playTanpuraDrone() {
    if (!this.ctx || !this.masterGain) return;

    const tanpuraGain = this.ctx.createGain();
    tanpuraGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    tanpuraGain.connect(this.masterGain);

    // D3 base string frequencies: Pa(220Hz), Sa(146.83Hz), Sa(146.83Hz), Kharaj Sa(73.41Hz)
    const pitches = [220.0, 146.83, 146.83, 73.41];
    let strIdx = 0;

    const pluckString = () => {
      if (!this.ctx || !this.isPlaying || this.currentMode !== 'tanpura') return;
      const freq = pitches[strIdx % pitches.length];
      strIdx++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const strGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 4.5, now);
      filter.Q.setValueAtTime(2.2, now);

      strGain.gain.setValueAtTime(0.001, now);
      strGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      strGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc.connect(filter);
      filter.connect(strGain);
      strGain.connect(tanpuraGain);

      osc.start(now);
      osc.stop(now + 4.0);
      this.activeNodes.push(osc, strGain, filter);
    };

    pluckString();
    this.loopInterval = setInterval(pluckString, 1400);
    this.activeNodes.push(tanpuraGain);
  }

  // --- 5. Desert War (Marching Drums & Somber Winds) ---
  private playDesertWarSound() {
    if (!this.ctx || !this.masterGain) return;

    // Distant rumble
    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    rumbleGain.connect(this.masterGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    const noise = this.createNoiseNode(filter, 0, 0);
    filter.connect(rumbleGain);

    // Deep rhythmic drum cadence
    const playDrumHit = () => {
      if (!this.ctx || !this.isPlaying || this.currentMode !== 'war') return;
      const now = this.ctx.currentTime;
      const drumOsc = this.ctx.createOscillator();
      const drumGain = this.ctx.createGain();

      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(75, now);
      drumOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

      drumGain.gain.setValueAtTime(0.3, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      drumOsc.connect(drumGain);
      drumGain.connect(this.masterGain!);

      drumOsc.start(now);
      drumOsc.stop(now + 0.85);
      this.activeNodes.push(drumOsc, drumGain);
    };

    playDrumHit();
    this.loopInterval = setInterval(playDrumHit, 2800);
    this.activeNodes.push(rumbleGain, filter, noise);
  }

  // --- 6. Elegy / Requiem Pad (Epitaph & Memory) ---
  private playElegyPad() {
    if (!this.ctx || !this.masterGain) return;

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    padGain.connect(this.masterGain);

    const chord = [146.83, 174.61, 220.0, 293.66]; // D minor warm harmony
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const oscGain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx!.currentTime);

      oscGain.gain.setValueAtTime(0.04, this.ctx!.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(padGain);

      osc.start();
      this.activeNodes.push(osc, filter, oscGain);
    });

    this.activeNodes.push(padGain);
  }

  private createNoiseNode(target: AudioNode, _freq?: number, _q?: number) {
    if (!this.ctx) return { stop: () => {}, disconnect: () => {} };

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.connect(target);
    whiteNoise.start();

    return whiteNoise;
  }
}

export const ambientEngine = new AmbientAudioEngine();
