export class ScreenShake {
  private age = 1;
  trigger(): void {
    this.age = 0;
  }
  update(dt: number): void {
    this.age += dt;
  }
  get offset(): number {
    return this.age < 0.25
      ? Math.sin(this.age * 150) * 4 * (1 - this.age / 0.25)
      : 0;
  }
  clear(): void {
    this.age = 1;
  }
}
