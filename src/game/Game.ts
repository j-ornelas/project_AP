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
import { StoreUI } from "../ui/StoreUI";
import { getItem } from "../types/StoreItems";

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
  private inputHandler: InputHandler;
  private movementMode: boolean = false; // Track if in movement mode
  private storeUI: StoreUI;

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
    this.inputHandler = new InputHandler(this);

    // Initialize store UI
    this.storeUI = new StoreUI();
    this.setupStoreHandlers();

    this.setupNetworkHandlers();
    this.resize();
  }

  private setupStoreHandlers(): void {
    const storeButton = document.getElementById("store-button");
    storeButton?.addEventListener("click", () => {
      if (!this.isMyTurn()) return;

      const currentDome = this.gameState.getCurrentDome();
      if (!currentDome) return;

      this.storeUI.show(currentDome.gold, currentDome.activeItems, (itemId) =>
        this.handleItemPurchase(itemId)
      );
    });
  }

  private handleItemPurchase(itemId: string): void {
    const currentDome = this.gameState.getCurrentDome();
    if (!currentDome) return;

    const item = getItem(itemId);
    if (!item) return;

    // Check if refunding (already purchased)
    const isRefund = currentDome.activeItems[item.category] === itemId;

    if (isRefund) {
      // Repair cannot be refunded (healing already applied)
      if (itemId === "repair") {
        console.log("Repair cannot be refunded - healing already applied");
        return;
      }

      // Refund
      currentDome.gold += item.cost;
      currentDome.activeItems[item.category] = null;

      // Remove shield if refunding shield
      if (itemId === "shield") {
        currentDome.hasShield = false;
      }
    } else {
      // Purchase
      if (currentDome.gold < item.cost) return;
      if (currentDome.activeItems[item.category] !== null) return;

      currentDome.gold -= item.cost;
      currentDome.activeItems[item.category] = itemId;

      // Apply immediate effects
      this.applyItemEffect(itemId, currentDome);
    }

    // Update store UI with new state
    this.storeUI.show(currentDome.gold, currentDome.activeItems, (itemId) =>
      this.handleItemPurchase(itemId)
    );
    this.updateUI();

    // Sync with server
    this.networkManager.reportItemPurchase(itemId, !isRefund);
  }

  private applyItemEffect(itemId: string, dome: any): void {
    switch (itemId) {
      case "shield":
        dome.hasShield = true;
        break;
      case "repair":
        dome.health = Math.min(dome.health + 30, 100);
        break;
      case "targeting_computer":
        // Set wind to player's last wind
        const lastWind = this.gameState.playerLastWinds.get(dome.playerId);
        if (lastWind !== undefined) {
          this.gameState.windSpeed = lastWind;
          this.gameState.updateWindDisplay(this.localPlayerId);
        }
        break;
      // Offensive items are applied when firing
    }
  }

  private setupNetworkHandlers(): void {
    // Handle opponent's shot
    this.networkManager.onShotFired = (data) => {
      // Only create projectile if it's not our own shot
      if (data.playerId !== this.localPlayerId) {
        this.createProjectile(data.power, data.angle);
      }
    };

    // Handle opponent's movement
    this.networkManager.onDomeMove = (data) => {
      if (data.playerId !== this.localPlayerId) {
        this.applyDomeMovement(data.playerNumber, data.newX, data.newY);
      }
    };

    // Handle turn changes
    this.networkManager.onTurnChange = (data) => {
      this.gameState.updateFromNetwork(data);
      this.gameState.resetTurnFlags(); // Reset movement flags for new turn
      this.updateMoveButtonState();
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
      // Apply wind to projectile physics
      this.physics.updateProjectile(
        this.projectile,
        deltaTime,
        this.gameState.windSpeed
      );

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
    const hitResult = this.gameState.checkDomeHit(
      impactX,
      this.projectile.isNuke
    );

    // Only create crater if shield didn't absorb
    if (!hitResult.shieldAbsorbed) {
      this.gameState.createCrater(impactX, this.projectile.isDigger);
    }

    // Only the current player (who fired) should report the impact
    // This prevents multiple clients from reporting the same impact
    if (this.isMyTurn()) {
      this.networkManager.reportImpact(
        impactX,
        impactY,
        hitResult.damage,
        hitResult.hitPlayerId,
        hitResult.shieldAbsorbed
      );
    }

    this.projectile = null;
    this.gameState.projectileInFlight = false;

    // Server will send turn change, so we wait for that
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawTerrain(this.gameState.terrain);

    // Get current angle for turret display
    const currentAngle = this.isMyTurn()
      ? this.inputHandler.getCurrentAngle()
      : null;
    this.renderer.drawDomes(
      this.gameState.domes,
      this.gameState.currentPlayer,
      currentAngle
    );

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
    this.updateMoveButtonState();
  }

  enterMovementMode(): void {
    if (!this.isMyTurn()) {
      return;
    }

    const currentDome = this.getCurrentPlayerDome();
    if (!currentDome || !currentDome.canMove()) {
      return;
    }

    this.movementMode = true;
    this.updateMoveButtonState();
    this.updateMovementPointsBar();
    const movementBar = document.getElementById("movement-points-bar");
    if (movementBar) movementBar.style.display = "flex";
  }

  exitMovementMode(): void {
    this.movementMode = false;
    this.updateMoveButtonState();
    const movementBar = document.getElementById("movement-points-bar");
    if (movementBar) movementBar.style.display = "none";
  }

  isInMovementMode(): boolean {
    return this.movementMode;
  }

  moveDome(direction: number): void {
    if (!this.isMyTurn() || !this.movementMode) {
      return;
    }

    const localPlayer = this.gameState.players.find(
      (p) => p.id === this.localPlayerId
    );
    if (!localPlayer) {
      return;
    }

    const domeIndex = localPlayer.playerNumber - 1;
    const dome = this.gameState.domes[domeIndex];

    // Check if out of movement points
    if (!dome || !dome.canMove()) {
      console.log("Out of movement points!");
      this.exitMovementMode();
      return;
    }

    // Move in small increments (2 pixels at a time)
    const success = this.gameState.moveDome(domeIndex, direction, 2);

    if (success) {
      // Sync position to server (throttled to avoid spam)
      this.sendMovementUpdate();
      // Update movement bar
      this.updateMovementPointsBar();

      // Auto-exit if out of points
      if (!dome.canMove()) {
        console.log("Movement points depleted!");
        this.exitMovementMode();
      }
    }
  }

  private movementUpdateTimeout: number | null = null;
  private lastSentPosition: { x: number; y: number } | null = null;

  private sendMovementUpdate(): void {
    // Throttle server updates to every 100ms
    if (this.movementUpdateTimeout !== null) {
      return;
    }

    this.movementUpdateTimeout = window.setTimeout(() => {
      const localPlayer = this.gameState.players.find(
        (p) => p.id === this.localPlayerId
      );
      if (!localPlayer) return;

      const dome = this.gameState.domes[localPlayer.playerNumber - 1];
      if (!dome) return;

      // Only send if position actually changed
      if (
        !this.lastSentPosition ||
        Math.abs(dome.x - this.lastSentPosition.x) > 5 ||
        Math.abs(dome.y - this.lastSentPosition.y) > 5
      ) {
        this.networkManager.reportDomeMove(
          localPlayer.playerNumber,
          dome.x,
          dome.y
        );
        this.lastSentPosition = { x: dome.x, y: dome.y };
      }

      this.movementUpdateTimeout = null;
    }, 100);
  }

  private updateMovementPointsBar(): void {
    const currentDome = this.getCurrentPlayerDome();
    if (!currentDome) return;

    const bar = document.getElementById("movement-points-fill");
    const text = document.getElementById("movement-points-text");

    if (bar && text) {
      const percentage =
        (currentDome.movementPointsRemaining / currentDome.movementRange) * 100;
      bar.style.width = `${percentage}%`;
      text.textContent = `${Math.ceil(currentDome.movementPointsRemaining)}/${
        currentDome.movementRange
      }`;
    }
  }

  private applyDomeMovement(
    playerNumber: number,
    newX: number,
    newY: number
  ): void {
    const domeIndex = playerNumber - 1;
    const dome = this.gameState.domes[domeIndex];
    if (dome) {
      dome.x = newX;
      dome.y = newY;
    }
  }

  private updateMoveButtonState(): void {
    const moveButton = document.getElementById(
      "move-button"
    ) as HTMLButtonElement;
    if (moveButton) {
      const currentDome = this.getCurrentPlayerDome();
      const canMove = this.isMyTurn() && currentDome && currentDome.canMove();
      moveButton.disabled = !canMove;

      if (this.movementMode) {
        moveButton.textContent = "Moving... (M to exit)";
        moveButton.style.opacity = "0.7";
      } else {
        moveButton.textContent = "Move (M)";
        moveButton.style.opacity = "1";
      }
    }
  }

  private getCurrentPlayerDome() {
    const localPlayer = this.gameState.players.find(
      (p) => p.id === this.localPlayerId
    );
    if (!localPlayer) return null;
    return this.gameState.domes[localPlayer.playerNumber - 1];
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
