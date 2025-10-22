export class Dome {
  playerId: number;
  x: number;
  y: number;
  radius: number = 40;
  health: number = 100;
  color: string;

  constructor(playerId: number, x: number, y: number, color: string) {
    this.playerId = playerId;
    this.x = x;
    this.y = y;
    this.color = color;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  isDestroyed(): boolean {
    return this.health <= 0;
  }
}
