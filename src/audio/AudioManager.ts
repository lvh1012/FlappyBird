export type Sound = 'flap' | 'score' | 'collision' | 'restart';
export class AudioManager {
  private context: AudioContext | undefined;
  private disabled = false;
  constructor(public muted: boolean) {}
  async unlock(): Promise<void> {
    if (this.disabled) return;
    try {
      if (!this.context) this.context = new AudioContext();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch {
      this.disabled = true;
    }
  }
  play(sound: Sound): void {
    const context = this.context;
    if (this.muted || this.disabled || !context || context.state !== 'running')
      return;
    try {
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      const start = { flap: 450, score: 800, collision: 120, restart: 550 }[
        sound
      ];
      oscillator.type = sound === 'collision' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(start, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        sound === 'score' ? 1200 : start / 2,
        context.currentTime + 0.12,
      );
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.045,
        context.currentTime + 0.008,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.16,
      );
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.17);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    } catch {
      this.disabled = true;
    }
  }
  dispose(): void {
    void this.context?.close().catch(() => {
      this.disabled = true;
    });
  }
}
