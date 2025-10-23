import { Dome } from "./entities/Dome";
import { Terrain } from "./entities/Terrain";
import { Projectile } from "./entities/Projectile";

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  clear(): void {
    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#87ceeb");
    gradient.addColorStop(1, "#f0e68c");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawTerrain(terrain: Terrain): void {
    this.ctx.fillStyle = "#8b7355";
    this.ctx.strokeStyle = "#654321";
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);

    // Draw terrain contour
    for (let x = 0; x < terrain.points.length; x++) {
      const y = terrain.points[x];
      this.ctx.lineTo(x, y);
    }

    this.ctx.lineTo(terrain.points.length, this.height);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawDomes(
    domes: Dome[],
    currentPlayer?: number,
    currentAngle?: number | null
  ): void {
    domes.forEach((dome) => {
      const showTurret =
        dome.playerId === currentPlayer &&
        currentAngle !== null &&
        currentAngle !== undefined;
      this.drawDome(dome, showTurret, currentAngle || 0);
    });
  }

  private drawDome(
    dome: Dome,
    showTurret: boolean = false,
    angle: number = 45
  ): void {
    const { x, y, radius, color, health } = dome;

    // Draw dome structure
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, Math.PI, 0, false);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Draw health bar
    const barWidth = 60;
    const barHeight = 8;
    const barX = x - barWidth / 2;
    const barY = y - radius - 20;

    // Background
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const healthWidth = (health / 100) * barWidth;
    this.ctx.fillStyle =
      health > 50 ? "#4CAF50" : health > 25 ? "#FF9800" : "#F44336";
    this.ctx.fillRect(barX, barY, healthWidth, barHeight);

    // Border
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Player number
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`P${dome.playerId}`, x, y + 10);

    // Draw turret if this is the current player
    if (showTurret) {
      this.drawTurret(x, y - radius, angle, color);
    }
  }

  private drawTurret(x: number, y: number, angle: number, color: string): void {
    const angleRad = (angle * Math.PI) / 180;
    const turretLength = 30;
    const turretWidth = 4;

    // Calculate turret end point
    const endX = x + Math.cos(angleRad) * turretLength;
    const endY = y - Math.sin(angleRad) * turretLength;

    // Draw turret barrel
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = turretWidth;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Draw turret tip (dot at the end)
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(endX, endY, turretWidth, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw aiming line (faint line showing trajectory)
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.globalAlpha = 0.5;

    const aimLineLength = 150;
    const aimEndX = x + Math.cos(angleRad) * aimLineLength;
    const aimEndY = y - Math.sin(angleRad) * aimLineLength;

    this.ctx.beginPath();
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(aimEndX, aimEndY);
    this.ctx.stroke();

    // Reset line dash and alpha
    this.ctx.setLineDash([]);
    this.ctx.globalAlpha = 1.0;
  }

  drawProjectile(projectile: Projectile): void {
    const { x, y, radius } = projectile.position;

    // Draw projectile with glow effect
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    gradient.addColorStop(0, "#ff6b6b");
    gradient.addColorStop(0.5, "#ff4444");
    gradient.addColorStop(1, "rgba(255, 68, 68, 0)");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw solid projectile
    this.ctx.fillStyle = "#ff0000";
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw trail
    this.drawProjectileTrail(projectile);
  }

  private drawProjectileTrail(projectile: Projectile): void {
    const trail = projectile.trail;
    if (trail.length < 2) return;

    this.ctx.strokeStyle = "rgba(255, 100, 100, 0.5)";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length; i++) {
      this.ctx.lineTo(trail[i].x, trail[i].y);
    }

    this.ctx.stroke();
  }
}
