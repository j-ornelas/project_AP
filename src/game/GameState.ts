import { Dome } from "./entities/Dome";
import { Terrain } from "./entities/Terrain";

export class GameState {
  currentPlayer: number = 1;
  projectileInFlight: boolean = false;
  domes: Dome[] = [];
  terrain: Terrain;

  constructor() {
    this.terrain = new Terrain();
    this.reset();
  }

  reset(): void {
    this.currentPlayer = 1;
    this.projectileInFlight = false;

    // Create two domes (players) at opposite ends
    this.domes = [
      new Dome(1, 200, 0, "#4CAF50"),
      new Dome(2, 1000, 0, "#2196F3"),
    ];

    // Generate terrain
    this.terrain.generate(1200);

    // Place domes on terrain
    this.domes.forEach((dome) => {
      dome.y = this.terrain.getHeight(dome.x);
    });
  }

  getCurrentDome(): Dome {
    return this.domes[this.currentPlayer - 1];
  }

  nextTurn(): void {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updateUI();
  }

  getTerrainHeight(x: number): number {
    return this.terrain.getHeight(x);
  }

  createCrater(x: number): void {
    this.terrain.createCrater(x, 50); // Crater radius of 50 pixels
  }

  checkDomeHit(projectileX: number): number {
    let totalDamage = 0;

    this.domes.forEach((dome) => {
      const distance = Math.abs(dome.x - projectileX);

      if (distance < 60) {
        // Direct hit radius
        const damage = Math.max(20, 50 - distance);
        dome.takeDamage(damage);
        totalDamage += damage;

        if (dome.health <= 0) {
          console.log(`Player ${dome.playerId} has been destroyed!`);
          // Game over logic here
        }
      }
    });

    return totalDamage;
  }

  private updateUI(): void {
    const currentPlayerElement = document.getElementById("current-player");
    if (currentPlayerElement) {
      currentPlayerElement.textContent = this.currentPlayer.toString();
    }
  }
}
