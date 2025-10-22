import { Projectile } from "./entities/Projectile";

export class Physics {
  private readonly gravity: number = 500; // pixels per second^2

  updateProjectile(projectile: Projectile, deltaTime: number): void {
    // Apply gravity to velocity
    projectile.velocity.y += this.gravity * deltaTime;

    // Update position based on velocity
    projectile.position.x += projectile.velocity.x * deltaTime;
    projectile.position.y += projectile.velocity.y * deltaTime;

    // Add to trail for visual effect
    projectile.addTrailPoint();
  }
}
