import { Renderer } from "./Renderer";
import { GameState } from "./GameState";
import { InputHandler } from "./InputHandler";
import { Physics } from "./Physics";
import { Projectile } from "./entities/Projectile";
import {
  NetworkManager,
  GameStartData,
  NetworkPlayer,
} from "../network/NetworkManager";

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private gameState: GameState;
  private physics: Physics;
  private lastTime: number = 0;
  private animationId: number | null = null;
  private projectile: Projectile | null = null;
  private networkManager: NetworkManager;
  private localPlayerId: string;

  constructor(
    canvas: HTMLCanvasElement,
    networkManager: NetworkManager,
    gameData: GameStartData
  ) {
    this.canvas = canvas;
    this.networkManager = networkManager;
    this.localPlayerId = networkManager.getLocalPlayerId() || "";

    this.renderer = new Renderer(canvas);
    this.gameState = new GameState(gameData);
    this.physics = new Physics();

    // Initialize input handler
    new InputHandler(this);

    this.setupNetworkHandlers();
    this.resize();
  }

  private setupNetworkHandlers(): void {
    // Handle opponent's shot
    this.networkManager.onShotFired = (data) => {
      // Only create projectile if it's not our own shot
      if (data.playerId !== this.localPlayerId) {
        this.createProjectile(data.power, data.angle);
      }
    };

    // Handle turn changes
    this.networkManager.onTurnChange = (data) => {
      this.gameState.updateFromNetwork(data);
      this.updateUI();
    };

    // Handle game over
    this.networkManager.onGameOver = (data) => {
      this.showGameOver(data.winner);
    };
  }

  start(): void {
    console.log("Multiplayer game starting...");
    this.updateUI();
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
    if (!this.projectile) return;

    const impactX = this.projectile.position.x;
    const impactY = this.projectile.position.y;

    // Check for dome hits and get damage/hit player
    const hitResult = this.gameState.checkDomeHit(impactX);

    // Only the current player (who fired) should report the impact
    // This prevents multiple clients from reporting the same impact
    if (this.isMyTurn()) {
      this.networkManager.reportImpact(
        impactX,
        impactY,
        hitResult.damage,
        hitResult.hitPlayerId
      );
    }

    this.projectile = null;
    this.gameState.projectileInFlight = false;

    // Server will send turn change, so we wait for that
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

    if (!this.isMyTurn()) {
      console.log("Not your turn!");
      return;
    }

    // Notify server
    this.networkManager.fire(power, angle);

    // Create local projectile
    this.createProjectile(power, angle);
  }

  private createProjectile(power: number, angle: number): void {
    const currentDome = this.gameState.getCurrentDome();
    if (!currentDome) return;

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
  }

  isMyTurn(): boolean {
    return this.gameState.isLocalPlayerTurn(this.localPlayerId);
  }

  private updateUI(): void {
    this.gameState.updateUI(this.localPlayerId);
  }

  private showGameOver(winner: NetworkPlayer): void {
    const isWinner = winner.id === this.localPlayerId;
    const message = isWinner
      ? `🎉 You Win! 🎉\n${winner.name} is victorious!`
      : `💥 Game Over 💥\n${winner.name} wins!`;

    setTimeout(() => {
      alert(message);
      location.reload();
    }, 1000);
  }

  getGameState(): GameState {
    return this.gameState;
  }
}
