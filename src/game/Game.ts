import { Renderer } from "./Renderer";
import { GameState } from "./GameState";
import { InputHandler } from "./InputHandler";
import { Physics } from "./Physics";
import { Projectile } from "./entities/Projectile";

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private gameState: GameState;
  private inputHandler: InputHandler;
  private physics: Physics;
  private lastTime: number = 0;
  private animationId: number | null = null;
  private projectile: Projectile | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.gameState = new GameState();
    this.physics = new Physics();
    this.inputHandler = new InputHandler(this);

    this.resize();
  }

  start(): void {
    console.log("Game starting...");
    this.gameState.reset();
    this.gameLoop(0);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resize(): void {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
      this.renderer.resize(this.canvas.width, this.canvas.height);
    }
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime / 1000); // Convert to seconds
    this.render();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private update(deltaTime: number): void {
    // Update projectile if in flight
    if (this.projectile && this.gameState.projectileInFlight) {
      this.physics.updateProjectile(this.projectile, deltaTime);

      // Check if projectile is out of bounds or hit ground
      if (this.checkProjectileCollision()) {
        this.handleProjectileEnd();
      }
    }
  }

  private checkProjectileCollision(): boolean {
    if (!this.projectile) return false;

    const { x, y } = this.projectile.position;
    const terrainHeight = this.gameState.getTerrainHeight(x);

    // Hit the ground
    if (y >= terrainHeight) {
      return true;
    }

    // Out of bounds
    if (x < 0 || x > this.canvas.width || y > this.canvas.height) {
      return true;
    }

    return false;
  }

  private handleProjectileEnd(): void {
    if (this.projectile) {
      // Create crater at impact point
      this.gameState.createCrater(this.projectile.position.x);

      // Check for dome hits
      const damage = this.gameState.checkDomeHit(this.projectile.position.x);
      if (damage > 0) {
        console.log(`Hit! Damage: ${damage}`);
      }
    }

    this.projectile = null;
    this.gameState.projectileInFlight = false;
    this.gameState.nextTurn();
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawTerrain(this.gameState.terrain);
    this.renderer.drawDomes(this.gameState.domes);

    if (this.projectile) {
      this.renderer.drawProjectile(this.projectile);
    }
  }

  fire(power: number, angle: number): void {
    if (this.gameState.projectileInFlight) {
      return; // Can't fire while projectile is in flight
    }

    const currentDome = this.gameState.getCurrentDome();
    const angleRad = (angle * Math.PI) / 180;

    // Calculate initial velocity based on power (power is 10-100)
    const velocity = (power / 100) * 800; // Max velocity of 800 pixels/second

    this.projectile = new Projectile(
      currentDome.x,
      currentDome.y - 50, // Start above dome
      velocity * Math.cos(angleRad),
      -velocity * Math.sin(angleRad)
    );

    this.gameState.projectileInFlight = true;
    console.log(
      `Player ${this.gameState.currentPlayer} fired! Power: ${power}, Angle: ${angle}`
    );
  }

  getGameState(): GameState {
    return this.gameState;
  }
}
