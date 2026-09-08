export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export class ScoreStorage {
  private best = 0;
  private muted = false;
  private port: StoragePort | undefined;
  constructor(resolve: () => StoragePort = () => localStorage) {
    try {
      this.port = resolve();
      const raw = this.port.getItem('fb.best');
      const parsed = raw === null || raw.trim() === '' ? 0 : Number(raw);
      this.best = Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
      this.muted = this.port.getItem('fb.muted') === 'true';
    } catch {
      this.port = undefined;
    }
  }
  getBest(): number {
    return this.best;
  }
  isMuted(): boolean {
    return this.muted;
  }
  saveBest(value: number): number {
    if (Number.isSafeInteger(value) && value > this.best) {
      this.best = value;
      this.write('fb.best', String(value));
    }
    return this.best;
  }
  setMuted(value: boolean): void {
    this.muted = value;
    this.write('fb.muted', String(value));
  }
  private write(key: string, value: string): void {
    try {
      this.port?.setItem(key, value);
    } catch {
      this.port = undefined; /* Continue with session-local settings. */
    }
  }
}
