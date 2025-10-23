import { Projectile } from "./entities/Projectile";

export class Physics {
  private readonly gravity: number = 500; // pixels per second^2

  updateProjectile(
    projectile: Projectile,
    deltaTime: number,
    windSpeed: number = 0
  ): void {
    // Apply gravity to velocity
    projectile.velocity.y += this.gravity * deltaTime;

    // Apply wind force (horizontal acceleration)
    // Wind speed is -100 to 100, convert to pixels/second^2
    const windAcceleration = windSpeed * 2; // Scale wind effect
    projectile.velocity.x += windAcceleration * deltaTime;

    // Update position based on velocity
    projectile.position.x += projectile.velocity.x * deltaTime;
    projectile.position.y += projectile.velocity.y * deltaTime;

    // Add to trail for visual effect
    projectile.addTrailPoint();
  }
}
