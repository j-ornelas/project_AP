interface Vector2 {
  x: number;
  y: number;
}

export class Projectile {
  position: Vector2 & { radius: number };
  velocity: Vector2;
  trail: Vector2[] = [];
  private maxTrailLength: number = 20;
  isNuke: boolean = false; // 3x radius, 2x damage
  isDigger: boolean = false; // 3x crater depth

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    isNuke = false,
    isDigger = false
  ) {
    this.position = { x, y, radius: 6 };
    this.velocity = { x: vx, y: vy };
    this.trail.push({ x, y });
    this.isNuke = isNuke;
    this.isDigger = isDigger;
  }

  addTrailPoint(): void {
    this.trail.push({ x: this.position.x, y: this.position.y });

    // Limit trail length for performance
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }
}
