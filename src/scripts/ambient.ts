/** Ruhige Meditationsmusik, live im Browser erzeugt: weiche Akkordflächen mit langsamem Wechsel. */
const CHORDS = [
  [130.81, 196.0, 246.94, 329.63], // Cmaj7
  [110.0, 164.81, 196.0, 261.63], // Am7
  [87.31, 130.81, 164.81, 220.0], // Fmaj7
  [98.0, 146.83, 196.0, 246.94], // G
];

export class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer = 0;
  private voices: { osc: OscillatorNode[]; gain: GainNode }[] = [];

  start(volume = 0.18): void {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    void ctx.resume();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    master.connect(filter).connect(ctx.destination);
    this.master = master;
    let i = 0;
    const play = () => {
      this.chord(CHORDS[i % CHORDS.length]);
      i++;
    };
    play();
    this.timer = window.setInterval(play, 9000);
  }

  private chord(freqs: number[]): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    for (const v of this.voices) {
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setValueAtTime(v.gain.gain.value, now);
      v.gain.gain.linearRampToValueAtTime(0, now + 4);
      v.osc.forEach((o) => o.stop(now + 4.2));
    }
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 4);
    gain.connect(this.master!);
    const osc = freqs.flatMap((f) =>
      [-3, 3].map((detune) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        o.detune.value = detune;
        o.connect(gain);
        o.start(now);
        return o;
      }),
    );
    this.voices = [{ osc, gain }];
  }

  stop(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    window.clearInterval(this.timer);
    this.master!.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
    window.setTimeout(() => ctx.close(), 2200);
    this.ctx = null;
    this.voices = [];
  }
}
