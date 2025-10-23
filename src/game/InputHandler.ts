import { Game } from "./Game";

export class InputHandler {
  private game: Game;
  private power: number = 50;
  private angle: number = 45;
  private keysPressed: Set<string> = new Set();

  constructor(game: Game) {
    this.game = game;
    this.setupEventListeners();
    this.startMovementLoop();
  }

  getCurrentAngle(): number {
    return this.angle;
  }

  private setupEventListeners(): void {
    // Power slider
    const powerSlider = document.getElementById(
      "power-slider"
    ) as HTMLInputElement;
    const powerValue = document.getElementById(
      "power-value"
    ) as HTMLSpanElement;

    if (powerSlider && powerValue) {
      powerSlider.addEventListener("input", (e) => {
        this.power = parseInt((e.target as HTMLInputElement).value);
        powerValue.textContent = this.power.toString();
      });
    }

    // Angle slider
    const angleSlider = document.getElementById(
      "angle-slider"
    ) as HTMLInputElement;
    const angleValue = document.getElementById(
      "angle-value"
    ) as HTMLSpanElement;

    if (angleSlider && angleValue) {
      angleSlider.addEventListener("input", (e) => {
        this.angle = parseInt((e.target as HTMLInputElement).value);
        angleValue.textContent = this.angle.toString();
      });
    }

    // Fire button
    const fireButton = document.getElementById(
      "fire-button"
    ) as HTMLButtonElement;

    if (fireButton) {
      fireButton.addEventListener("click", () => {
        this.handleFire();
      });
    }

    // Move button
    const moveButton = document.getElementById(
      "move-button"
    ) as HTMLButtonElement;

    if (moveButton) {
      moveButton.addEventListener("click", () => {
        this.game.enterMovementMode();
      });
    }

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      this.keysPressed.add(e.key);
      this.handleKeyDown(e);
    });

    document.addEventListener("keyup", (e) => {
      this.keysPressed.delete(e.key);
    });
  }

  private startMovementLoop(): void {
    // Check for held keys every 16ms (about 60 FPS)
    window.setInterval(() => {
      if (this.game.isInMovementMode()) {
        if (this.keysPressed.has("ArrowLeft")) {
          this.game.moveDome(-1);
        }
        if (this.keysPressed.has("ArrowRight")) {
          this.game.moveDome(1);
        }
      }
    }, 16);
  }

  private handleFire(): void {
    const gameState = this.game.getGameState();

    if (gameState.projectileInFlight) {
      return; // Can't fire while projectile is in flight
    }

    this.game.fire(this.power, this.angle);
    this.disableControls();

    // Re-enable controls after projectile lands (approximation)
    setTimeout(() => {
      this.enableControls();
    }, 5000);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const gameState = this.game.getGameState();

    if (gameState.projectileInFlight) {
      return;
    }

    // Check if it's the player's turn
    if (!this.game.isMyTurn()) {
      return;
    }

    // Handle movement mode
    if (this.game.isInMovementMode()) {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          // Don't process if already moving
          break;
        case "ArrowRight":
          e.preventDefault();
          // Don't process if already moving
          break;
        case "Escape":
        case "m":
        case "M":
          e.preventDefault();
          this.game.exitMovementMode();
          break;
      }
      return; // Don't process other keys in movement mode
    }

    // Normal aiming mode
    switch (e.key) {
      case "ArrowUp":
        this.adjustPower(1);
        break;
      case "ArrowDown":
        this.adjustPower(-1);
        break;
      case "ArrowRight":
        this.adjustAngle(-1); // Decrease angle = move turret right
        break;
      case "ArrowLeft":
        this.adjustAngle(1); // Increase angle = move turret left
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        this.handleFire();
        break;
      case "m":
      case "M":
        e.preventDefault();
        // Toggle movement mode
        if (this.game.isInMovementMode()) {
          this.game.exitMovementMode();
        } else {
          this.game.enterMovementMode();
        }
        break;
    }
  }

  private adjustPower(delta: number): void {
    this.power = Math.max(10, Math.min(100, this.power + delta));
    const powerSlider = document.getElementById(
      "power-slider"
    ) as HTMLInputElement;
    const powerValue = document.getElementById(
      "power-value"
    ) as HTMLSpanElement;

    if (powerSlider) powerSlider.value = this.power.toString();
    if (powerValue) powerValue.textContent = this.power.toString();
  }

  private adjustAngle(delta: number): void {
    this.angle = Math.max(0, Math.min(180, this.angle + delta));
    const angleSlider = document.getElementById(
      "angle-slider"
    ) as HTMLInputElement;
    const angleValue = document.getElementById(
      "angle-value"
    ) as HTMLSpanElement;

    if (angleSlider) angleSlider.value = this.angle.toString();
    if (angleValue) angleValue.textContent = this.angle.toString();
  }

  private disableControls(): void {
    const fireButton = document.getElementById(
      "fire-button"
    ) as HTMLButtonElement;
    const powerSlider = document.getElementById(
      "power-slider"
    ) as HTMLInputElement;
    const angleSlider = document.getElementById(
      "angle-slider"
    ) as HTMLInputElement;

    if (fireButton) fireButton.disabled = true;
    if (powerSlider) powerSlider.disabled = true;
    if (angleSlider) angleSlider.disabled = true;
  }

  private enableControls(): void {
    const fireButton = document.getElementById(
      "fire-button"
    ) as HTMLButtonElement;
    const powerSlider = document.getElementById(
      "power-slider"
    ) as HTMLInputElement;
    const angleSlider = document.getElementById(
      "angle-slider"
    ) as HTMLInputElement;

    if (fireButton) fireButton.disabled = false;
    if (powerSlider) powerSlider.disabled = false;
    if (angleSlider) angleSlider.disabled = false;
  }
}
